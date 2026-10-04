import { getStore } from "@netlify/blobs";

const store = getStore("kelas-x11-public-tasks");
const maxFileSize = 4 * 1024 * 1024;
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function isValidId(id) {
  return /^[0-9a-f-]{36}$/i.test(id || "");
}

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsedDate = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
}

async function getTasks() {
  const { blobs } = await store.list({ prefix: "task:" });
  const tasks = await Promise.all(
    blobs.map(async ({ key }) => {
      const task = await store.get(key, { type: "json" });
      if (!task) return null;
      return {
        ...task,
        attachmentUrl: task.attachmentName
          ? `/api/tasks?attachment=${encodeURIComponent(task.id)}`
          : "",
      };
    }),
  );

  return tasks
    .filter(Boolean)
    .sort((first, second) => second.createdAt - first.createdAt);
}

async function getAttachment(id) {
  const task = await store.get(`task:${id}`, { type: "json" });
  if (!task?.attachmentName) return new Response("Lampiran tidak ditemukan.", { status: 404 });

  const attachment = await store.get(`attachment:${id}`, { type: "blob" });
  if (!attachment) return new Response("Lampiran tidak ditemukan.", { status: 404 });

  const isImage = task.attachmentType.startsWith("image/");
  const safeName = task.attachmentName.replace(/["\\\r\n]/g, "_");
  const asciiName = safeName.replace(/[^\x20-\x7e]/g, "_");
  const encodedName = encodeURIComponent(safeName).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return new Response(attachment, {
    headers: {
      "content-type": task.attachmentType,
      "content-disposition": `${isImage ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox",
    },
  });
}

async function createTask(request) {
  const formData = await request.formData();
  const title = formData.get("title");
  const type = formData.get("type");
  const due = formData.get("due");
  const attachment = formData.get("attachment");

  if (typeof title !== "string" || !title.trim() || title.trim().length > 80) {
    return jsonResponse({ error: "Judul wajib diisi (maksimal 80 karakter)." }, 400);
  }
  if (type !== "Tugas" && type !== "PR") {
    return jsonResponse({ error: "Jenis tugas tidak valid." }, 400);
  }
  if (typeof due !== "string" || (due && !isValidDate(due))) {
    return jsonResponse({ error: "Tanggal deadline tidak valid." }, 400);
  }
  if (attachment && typeof attachment !== "string" && attachment.size === 0) {
    return jsonResponse({ error: "Lampiran yang dipilih kosong." }, 400);
  }
  if (attachment && (typeof attachment === "string" || attachment.size > maxFileSize)) {
    return jsonResponse({ error: "Ukuran lampiran maksimal 4 MB." }, 400);
  }
  if (attachment && (!allowedTypes.has(attachment.type) || !attachment.name.trim())) {
    return jsonResponse({ error: "Format lampiran tidak didukung." }, 400);
  }

  const { blobs } = await store.list({ prefix: "task:" });
  if (blobs.length >= 1000) {
    return jsonResponse({ error: "Daftar tugas sudah mencapai batas." }, 429);
  }

  const id = crypto.randomUUID();
  const task = {
    id,
    title: title.trim(),
    type,
    due,
    createdAt: Date.now(),
    attachmentName: attachment ? attachment.name.replace(/[/\\\r\n]/g, "_").slice(0, 180) : "",
    attachmentType: attachment ? attachment.type : "",
  };

  if (attachment) {
    await store.set(`attachment:${id}`, attachment, {
      metadata: { contentType: attachment.type },
    });
  }

  try {
    await store.setJSON(`task:${id}`, task);
  } catch (error) {
    if (attachment) await store.delete(`attachment:${id}`);
    throw error;
  }

  return jsonResponse(task, 201);
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    if (request.method === "GET" && url.searchParams.has("attachment")) {
      const id = url.searchParams.get("attachment");
      if (!isValidId(id)) return new Response("Lampiran tidak ditemukan.", { status: 404 });
      return await getAttachment(id);
    }
    if (request.method === "GET") return jsonResponse(await getTasks());
    if (request.method === "POST") return await createTask(request);
    return jsonResponse({ error: "Metode tidak didukung." }, 405);
  } catch (error) {
    console.error("Kesalahan layanan tugas publik:", error);
    return jsonResponse({ error: "Layanan tugas sedang bermasalah. Coba lagi nanti." }, 500);
  }
};
