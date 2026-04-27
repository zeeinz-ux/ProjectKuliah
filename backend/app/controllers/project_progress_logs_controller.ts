import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs'
import Project from '#models/project'
import ProjectProgressLog from '#models/project_progress_log'
import { createActivityLog } from '#services/activity_log_service'

function getCurrentUserId(ctx: HttpContext) {
  const user = (ctx as any).auth?.user
  return user?.id ? Number(user.id) : null
}

export default class ProjectProgressLogsController {
  async store(ctx: HttpContext) {
    const { params, request, response } = ctx
    const userId = getCurrentUserId(ctx)

    const project = await Project.find(params.id)

    if (!project) {
      return response.notFound({
        message: 'Project tidak ditemukan.',
      })
    }

    const author = request.input('author') || 'Tim Lapangan'
    const note = request.input('note')

    if (!note || !String(note).trim()) {
      return response.badRequest({
        message: 'Catatan progress wajib diisi.',
      })
    }

    const image = request.file('image', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png'],
    })

    let imagePath: string | null = null

    if (image) {
      if (!image.isValid) {
        return response.badRequest({
          message: image.errors[0]?.message || 'File gambar tidak valid.',
        })
      }

      const uploadDir = app.makePath('public/uploads/progress')

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const fileName = `progress-${cuid()}.${image.extname}`

      await image.move(uploadDir, {
        name: fileName,
        overwrite: true,
      })

      imagePath = `uploads/progress/${fileName}`
    }

    const cleanAuthor = String(author).trim()
    const cleanNote = String(note).trim()

    const log = await ProjectProgressLog.create({
      projectId: project.id,
      author: cleanAuthor,
      note: cleanNote,
      image: imagePath,
    })

    await createActivityLog({
      userId,
      module: 'project_progress',
      action: 'created',
      title: 'Update progress lapangan',
      description: `Progress project ${project.name} berhasil diperbarui oleh ${cleanAuthor}.`,
      icon: 'doc',
      color: 'green',
      metadata: {
        projectId: project.id,
        projectName: project.name,
        progressLogId: log.id,
        author: cleanAuthor,
        note: cleanNote,
        image: imagePath,
      },
    })

    if (imagePath) {
      await createActivityLog({
        userId,
        module: 'documentation',
        action: 'uploaded',
        title: 'Dokumentasi diunggah',
        description: `Foto progress untuk project ${project.name} berhasil diunggah.`,
        icon: 'doc',
        color: 'blue',
        metadata: {
          projectId: project.id,
          projectName: project.name,
          progressLogId: log.id,
          author: cleanAuthor,
          image: imagePath,
        },
      })
    }

    return response.created({
      message: 'Update progress berhasil ditambahkan.',
      data: {
        id: log.id,
        projectId: log.projectId,
        author: log.author,
        note: log.note,
        img: log.image,
        image: log.image,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        date:
          log.createdAt
            ?.setZone('Asia/Jakarta')
            .setLocale('id')
            .toFormat("dd LLL yyyy, HH:mm 'WIB'") || '',
      },
    })
  }

  async destroy(ctx: HttpContext) {
    const { params, response } = ctx
    const userId = getCurrentUserId(ctx)

    const project = await Project.find(params.projectId)

    const log = await ProjectProgressLog.query()
      .where('id', params.logId)
      .where('project_id', params.projectId)
      .first()

    if (!log) {
      return response.notFound({
        message: 'Update progress tidak ditemukan.',
      })
    }

    const deletedLog = {
      id: log.id,
      projectId: log.projectId,
      author: log.author,
      note: log.note,
      image: log.image,
    }

    if (log.image) {
      const cleanPath = String(log.image).replace(/^\/+/, '')

      if (cleanPath.startsWith('uploads/progress/')) {
        const filePath = app.makePath('public', cleanPath)

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }

    await log.delete()

    await createActivityLog({
      userId,
      module: 'project_progress',
      action: 'deleted',
      title: 'Update progress dihapus',
      description: `Update progress project ${project?.name || 'Project'} berhasil dihapus.`,
      icon: 'doc',
      color: 'red',
      metadata: {
        projectId: deletedLog.projectId,
        projectName: project?.name || null,
        progressLogId: deletedLog.id,
        author: deletedLog.author,
        note: deletedLog.note,
        image: deletedLog.image,
      },
    })

    return response.ok({
      message: 'Update progress dan file foto berhasil dihapus.',
    })
  }
}
