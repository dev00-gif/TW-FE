import { z } from 'zod'
import { endOfMonth, format, startOfMonth } from 'date-fns'

export function scheduleMonthRange(date: Date) {
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const attachmentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('url'), url: z.string().refine(isHttpUrl) }),
  z.object({
    type: z.literal('upload'),
    mediaId: z.string().min(1),
    name: z.string().min(1),
    url: z
      .string()
      .refine(
        (value) => isHttpUrl(value) || /^\/(?:images|uploads)\//.test(value),
      ),
    mimeType: z.string().min(1),
    size: z.number().nonnegative(),
  }),
])

const importSchema = z.array(
  z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.enum([
      'normal',
      'propaganda',
      'warning',
      'emergency',
      'maintenance',
    ]),
    channel: z.enum(['radio', 'digital', 'both']),
    area: z.string().min(1),
    scheduledAt: z
      .string()
      .min(16)
      .refine((value) => !Number.isNaN(new Date(value).getTime())),
    status: z.enum(['published', 'pending', 'cancelled']),
    deviceCount: z.number().int().positive(),
    image: z.string().optional(),
    attachment: attachmentSchema.optional(),
    provinceCode: z.string().optional(),
    wardCode: z.string().optional(),
  }),
)

export function parseScheduleImport(text: string) {
  try {
    return importSchema.safeParse(JSON.parse(text))
  } catch {
    return importSchema.safeParse(null)
  }
}
