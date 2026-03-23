import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nepa API",
      version: "1.0.0",
      description: "API documentation for Nepa Billing System",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UserCreate: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", default: "USER" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string" },
            billId: { type: "string" },
            userId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string", default: "XLM" },
            status: { type: "string", enum: ["PENDING", "SUCCESS", "FAILED"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PaymentCreate: {
          type: "object",
          required: ["billId", "userId", "amount"],
          properties: {
            billId: { type: "string" },
            userId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string", default: "XLM" },
          },
        },
      },
    },
  },
  apis: ["./**/*.ts"], // Scan all ts files for annotations
};

export const swaggerSpec = swaggerJsdoc(options);
