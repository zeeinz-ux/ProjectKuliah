import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

type HolidayDetail = {
  id: string
  date: string
  name: string
  description: string
  htmlLink: string
}

type GoogleCalendarItem = {
  id?: string
  summary?: string
  description?: string
  htmlLink?: string
  start?: {
    date?: string
    dateTime?: string
  }
}

type GoogleCalendarApiResponse = {
  error?: {
    message?: string
  }
  message?: string
  items?: GoogleCalendarItem[]
}

const DEFAULT_CALENDAR_ID = 'en.indonesian.official#holiday@group.v.calendar.google.com'
const FALLBACK_CALENDAR_ID = 'en.indonesian#holiday@group.v.calendar.google.com'

function normalizeDateToYMD(value: string) {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.slice(0, 10)
  }

  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
  }

  return ''
}

function unfoldIcsText(rawText: string) {
  return rawText.replace(/\r?\n[ \t]/g, '')
}

function unescapeIcsText(value: string) {
  return value
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/g, ' ')
    .replace(/\\\\/g, '\\')
    .trim()
}

function getIcsLineValue(block: string, key: string) {
  const regex = new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'm')
  const match = block.match(regex)

  return match?.[1]?.trim() || ''
}

function parseIcsHolidays(rawIcs: string, year: string) {
  const icsText = unfoldIcsText(rawIcs)
  const blocks = icsText.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || []

  const holidayDetails: HolidayDetail[] = []

  for (const block of blocks) {
    const rawDate = getIcsLineValue(block, 'DTSTART')
    const date = normalizeDateToYMD(rawDate)

    if (!date || !date.startsWith(`${year}-`)) {
      continue
    }

    const name = unescapeIcsText(getIcsLineValue(block, 'SUMMARY') || 'Hari Libur Nasional')
    const description = unescapeIcsText(getIcsLineValue(block, 'DESCRIPTION') || 'Public holiday')
    const uid = unescapeIcsText(getIcsLineValue(block, 'UID') || `holiday-${date}-${name}`)
    const htmlLink = unescapeIcsText(getIcsLineValue(block, 'URL') || '')

    holidayDetails.push({
      id: uid,
      date,
      name,
      description,
      htmlLink,
    })
  }

  return holidayDetails.sort((a, b) => a.date.localeCompare(b.date))
}

async function fetchFromGoogleCalendarApi(calendarId: string, apiKey: string, year: string) {
  const timeMin = `${year}-01-01T00:00:00Z`
  const timeMax = `${Number(year) + 1}-01-01T00:00:00Z`

  const googleApiUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  )

  googleApiUrl.searchParams.set('key', apiKey)
  googleApiUrl.searchParams.set('timeMin', timeMin)
  googleApiUrl.searchParams.set('timeMax', timeMax)
  googleApiUrl.searchParams.set('singleEvents', 'true')
  googleApiUrl.searchParams.set('orderBy', 'startTime')
  googleApiUrl.searchParams.set('maxResults', '2500')

  const googleResponse = await fetch(googleApiUrl.toString())

  const googleData = (await googleResponse.json().catch(() => ({}))) as GoogleCalendarApiResponse

  if (!googleResponse.ok) {
    throw new Error(
      googleData.error?.message ||
        googleData.message ||
        'Google Calendar API gagal mengambil data holiday'
    )
  }

  const items = Array.isArray(googleData.items) ? googleData.items : []
  const holidayDetails: HolidayDetail[] = []

  for (const item of items) {
    const date = normalizeDateToYMD(item.start?.date || item.start?.dateTime || '')

    if (!date || !date.startsWith(`${year}-`)) {
      continue
    }

    holidayDetails.push({
      id: String(item.id || `holiday-${date}`),
      date,
      name: String(item.summary || 'Hari Libur Nasional'),
      description: String(item.description || 'Public holiday'),
      htmlLink: String(item.htmlLink || ''),
    })
  }

  return holidayDetails.sort((a, b) => a.date.localeCompare(b.date))
}

async function fetchFromGoogleCalendarIcs(calendarId: string, year: string) {
  const icsUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(
    calendarId
  )}/public/basic.ics`

  const icsResponse = await fetch(icsUrl)
  const icsText = await icsResponse.text()

  if (!icsResponse.ok) {
    throw new Error('Google Calendar ICS fallback gagal mengambil data holiday.')
  }

  return parseIcsHolidays(icsText, year)
}

function buildCalendarIdCandidates() {
  const configuredCalendarId = env.get('GOOGLE_HOLIDAY_CALENDAR_ID') || DEFAULT_CALENDAR_ID

  return Array.from(
    new Set([configuredCalendarId, DEFAULT_CALENDAR_ID, FALLBACK_CALENDAR_ID].filter(Boolean))
  )
}

export default class CalendarController {
  async show({ params, response }: HttpContext) {
    const year = String(params.year || '').trim()

    if (!/^\d{4}$/.test(year)) {
      return response.status(422).json({
        message: 'Format tahun tidak valid.',
        year,
        country: 'ID',
        source: 'validation_error',
        holidays: [],
        holidayDetails: [],
      })
    }

    const apiKey = env.get('GOOGLE_CALENDAR_API_KEY') || ''
    const calendarIds = buildCalendarIdCandidates()
    const errors: string[] = []

    if (apiKey) {
      for (const calendarId of calendarIds) {
        try {
          const holidayDetails = await fetchFromGoogleCalendarApi(calendarId, apiKey, year)
          const holidays = holidayDetails.map((holiday) => holiday.date)

          if (holidays.length > 0) {
            return response.ok({
              message: 'Data holiday berhasil diambil dari Google Calendar API.',
              year,
              country: 'ID',
              source: 'google_calendar_api',
              calendarId,
              holidays,
              holidayDetails,
            })
          }

          errors.push(`Google Calendar API kosong untuk calendarId: ${calendarId}`)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Google Calendar API gagal untuk ${calendarId}: ${message}`)
          console.error('Google Calendar API holiday error:', error)
        }
      }
    } else {
      errors.push('GOOGLE_CALENDAR_API_KEY belum tersedia di backend/.env')
    }

    for (const calendarId of calendarIds) {
      try {
        const holidayDetails = await fetchFromGoogleCalendarIcs(calendarId, year)
        const holidays = holidayDetails.map((holiday) => holiday.date)

        if (holidays.length > 0) {
          return response.ok({
            message: 'Data holiday berhasil diambil dari Google Calendar ICS fallback.',
            year,
            country: 'ID',
            source: 'google_calendar_ics_fallback',
            calendarId,
            holidays,
            holidayDetails,
          })
        }

        errors.push(`ICS fallback kosong untuk calendarId: ${calendarId}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`ICS fallback gagal untuk ${calendarId}: ${message}`)
        console.error('Google Calendar ICS fallback error:', error)
      }
    }

    return response.status(500).json({
      message: 'Gagal mengambil data holiday dari Google Calendar API dan ICS fallback.',
      year,
      country: 'ID',
      source: 'google_calendar_failed',
      calendarIds,
      errors,
      holidays: [],
      holidayDetails: [],
    })
  }
}
