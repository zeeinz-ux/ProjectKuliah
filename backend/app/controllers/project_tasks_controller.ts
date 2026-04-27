import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import ProjectTask from '#models/project_task'

export default class ProjectTasksController {
  // =========================
  // POST /api/projects/:id/tasks
  // Tambah task baru ke project
  // =========================
  async store({ params, request, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.notFound({
        message: 'Project tidak ditemukan.',
      })
    }

    const label = request.input('label')

    if (!label || !String(label).trim()) {
      return response.badRequest({
        message: 'Nama task wajib diisi.',
      })
    }

    const task = await ProjectTask.create({
      projectId: project.id,
      label: String(label).trim(),
      done: false,
    })

    return response.created({
      message: 'Task berhasil ditambahkan.',
      data: {
        id: task.id,
        projectId: task.projectId,
        label: task.label,
        done: task.done,
      },
    })
  }

  // =========================
  // PUT /api/projects/:projectId/tasks/:taskId
  // Update task: checklist / uncheck / ubah label
  // =========================
  async update({ params, request, response }: HttpContext) {
    const task = await ProjectTask.query()
      .where('id', params.taskId)
      .where('project_id', params.projectId)
      .first()

    if (!task) {
      return response.notFound({
        message: 'Task tidak ditemukan.',
      })
    }

    const label = request.input('label')
    const done = request.input('done')

    if (label !== undefined) {
      if (!String(label).trim()) {
        return response.badRequest({
          message: 'Nama task tidak boleh kosong.',
        })
      }

      task.label = String(label).trim()
    }

    if (done !== undefined) {
      task.done = Boolean(done)
    }

    await task.save()

    return response.ok({
      message: 'Task berhasil diperbarui.',
      data: {
        id: task.id,
        projectId: task.projectId,
        label: task.label,
        done: task.done,
      },
    })
  }

  // =========================
  // DELETE /api/projects/:projectId/tasks/:taskId
  // Hapus task dari project
  // =========================
  async destroy({ params, response }: HttpContext) {
    const task = await ProjectTask.query()
      .where('id', params.taskId)
      .where('project_id', params.projectId)
      .first()

    if (!task) {
      return response.notFound({
        message: 'Task tidak ditemukan.',
      })
    }

    await task.delete()

    return response.ok({
      message: 'Task berhasil dihapus.',
    })
  }
}
