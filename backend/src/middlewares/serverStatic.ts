import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Нормализуем и проверяем путь, чтобы избежать обхода директорий
        const normalizedPath = path
            .normalize(req.path)
            .replace(/^(\.\.(\/|\\|$))+/, '')
            .replace(/^[/\\]+/, '')
        const filePath = path.join(baseDir, normalizedPath)

        if (!filePath.startsWith(baseDir)) {
            return next()
        }

        // Проверяем, существует ли файл
        fs.access(filePath, fs.constants.F_OK, (accessError) => {
            if (accessError) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            return res.sendFile(filePath, (sendError) => {
                if (sendError) {
                    next(sendError)
                }
            })
        })
    }
}
