import { string, z} from "zod"

export const CreateUserSchema = z.object({
    email : z.string(),
    password : z.string(),
    name : z.string(),
    photo : z.string().optional()
})

export const CreateSigninSchema = z.object({
    email : z.string(),
    password : z.string()
})

export const CreateRoomSchema = z.object({
   slug: z.string()
})
