import bodyParser from 'body-parser'
import express from 'express'
import { PrismaClient } from '@prisma/client';  // Inisialisasi Prisma Client

const prisma = new PrismaClient();  
const app = express()
const port = parseInt(process.env.PORT, 10) || 9000; // Port number harus number
app.use(bodyParser.json())




// Route untuk menyimpan buku
app.post("/books", async (req, res) => {
  try {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Gagal menambahkan buku. Mohon isi nama buku",
      });
    }

    if (readPage > pageCount) {
      return res.status(400).json({
        status: "fail",
        message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
      });
    }

    const finished = pageCount === readPage;

    const newBook = await prisma.book.create({
      data: {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: newBook.id,
      },
    });
  } catch (error) {
    console.error("Error saat menambahkan buku:", error);  
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
});


//semua buku
app.get("/books", async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        publisher: true,
      },
    });

    return res.status(200).json({
      status: "success",
      data: {
        books,
      },
    });
  } catch (error) {
    console.error("Error saat mengambil buku:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
});

//detail buku
app.get("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return res.status(404).json({
        status: "fail",
        message: "Buku tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        book,
      },
    });
  } catch (error) {
    console.error("Error saat mengambil detail buku:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
});

//put
app.put("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Gagal memperbarui buku. Mohon isi nama buku",
      });
    }

    if (readPage > pageCount) {
      return res.status(400).json({
        status: "fail",
        message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      });
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!existingBook) {
      return res.status(404).json({
        status: "fail",
        message: "Gagal memperbarui buku. Id tidak ditemukan",
      });
    }

    const finished = pageCount === readPage;

    await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt: new Date().toISOString(), 
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error saat memperbarui buku:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
});

//delete
app.delete("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!existingBook) {
      return res.status(404).json({
        status: "fail",
        message: "Buku gagal dihapus. Id tidak ditemukan",
      });
    }

    await prisma.book.delete({
      where: {
        id: bookId,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Buku berhasil dihapus",
    });
  } catch (error) {
    console.error("Error saat menghapus buku:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})