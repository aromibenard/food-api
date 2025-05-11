import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400,
        public details?: any
    ) {
        super(message);
    }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: "Validation failed",
            details: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }

    // Handle custom AppErrors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            ...(err.details && { details: err.details })
        });
        return;
    }

    // Handle unexpected errors
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};