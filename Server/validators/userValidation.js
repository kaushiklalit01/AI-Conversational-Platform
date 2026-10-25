import {z} from "zod";

export const signupSchema = z.object({
  name: z.string()
        .trim()
        .min(3, {message: "Name must be at least 3 characters long"})
        .max(30, {message: "Name must be at most 30 characters long"}),

  age: z.number()
        .min(10, {message: "Age must be at least 10"})
        .max(100, {message: "Age must be at most 100"})
        .optional(),

  email: z.preprocess(
    (value) => typeof value === "string" ? value.trim().toLowerCase() :"",
    z.string().email({message: "Invalid email address"})),

  password: z.string()
            .min(6, {message: "Password must be at least 6 characters long"})
            .max(20, {message: "Password must be at most 20 characters long"})
            .regex(/[A-Z]/,"Your password should contain at least one uppercase letter")
            .regex(/[a-z]/,"Your password should contain at least one lowercase letter")
            .regex(/[0-9]/,"Your password should contain at least one number")
            .regex(/[!@#$%^&*(),.?":{}|<>]/,"Your password should contain at least one special character")
});


export const loginSchema = z.object({
    email: z.preprocess(
    (value) => typeof value === "string" ? value.trim().toLowerCase() :"",
    z.string().email({message: "Invalid email address"})),

    password: z.string()
              .min(6, {message: "Password must be at least 6 characters long"})
              .max(20, {message: "Password must be at most 20 characters long"})
              .regex(/[A-Z]/,"Your password should contain at least one uppercase letter")
              .regex(/[a-z]/,"Your password should contain at least one lowercase letter")
              .regex(/[0-9]/,"Your password should contain at least one number")
              .regex(/[!@#$%^&*(),.?":{}|<>]/,"Your password should contain at least one special character")

})