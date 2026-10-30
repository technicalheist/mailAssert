import prisma from "@/lib/prisma";

export async function nextId(key: string): Promise<number> {
  const counter = await prisma.counter.upsert({
    where: { id: key },
    create: { id: key, seq: 1 },
    update: { seq: { increment: 1 } },
    select: { seq: true },
  });
  return counter.seq;
}
