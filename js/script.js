document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('form-add')
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault()
        addBook()
        event.target.reset()
    })

    const searchForm = document.getElementById('form-search')
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault()
        searchBook()
    })

    if (isStorageExist()) {
        loadDataFromStorage()
    }
})

const books = []
const filtered = []
const RENDER_EVENT = 'render-book'
const SEARCH_EVENT = 'filter-book'

const searchBook = () => {
    const searchText = document.getElementById('searchBook').value.toLowerCase()
    filtered.splice(0, filtered.length)

    for (let i = 0; i < books.length; i++) {
        const book = books[i].title.toLowerCase()

        if (book.includes(searchText)) {
            filtered.push(books[i])
        }
    }

    document.dispatchEvent(new Event(SEARCH_EVENT))
    toast('search', filtered.length)
}

const addBook = () => {
    const generatedID = generateId()
    const bookTitle = document.getElementById('title').value
    const bookAuthor = document.getElementById('author').value
    const bookYear = document.getElementById('year').value
    const isComplete = document.getElementById('isComplete').checked

    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete)
    books.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    toast('add')
}

const generateId = () => {
    return +new Date()
}

const generateBookObject = (id, title, author, year, isComplete) => {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, () => {
    const uncompletedBOOKList = document.getElementById('books')
    uncompletedBOOKList.innerHTML = ''

    const completedBOOKList = document.getElementById('completed-books')
    completedBOOKList.innerHTML = ''

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem)
        if (!bookItem.isComplete) {
            uncompletedBOOKList.append(bookElement)
        } else {
            completedBOOKList.append(bookElement)
        }
    }
})

document.addEventListener(SEARCH_EVENT, () => {
    const uncompletedBOOKList = document.getElementById('books')
    uncompletedBOOKList.innerHTML = ''

    const completedBOOKList = document.getElementById('completed-books')
    completedBOOKList.innerHTML = ''

    for (const bookItem of filtered) {
        const bookElement = makeBook(bookItem)
        if (!bookItem.isComplete) {
            uncompletedBOOKList.append(bookElement)
        } else {
            completedBOOKList.append(bookElement)
        }
    }
})

const makeBook = (bookObject) => {
    const { id, title, author, year, isComplete } = bookObject

    const bookTitle = document.createElement('h2')
    bookTitle.innerText = title

    const bookAuthor = document.createElement('p')
    bookAuthor.innerText = `Penulis: ${author}`

    const bookYear = document.createElement('p')
    bookYear.innerText = `Tahun: ${year}`

    const card = document.createElement('div')
    card.classList.add('inner')
    card.append(bookTitle, bookAuthor, bookYear)

    const container = document.createElement('div')
    container.classList.add('item', 'shadow')
    container.append(card)
    container.setAttribute('id', `book-${id}`)

    const trashButton = document.createElement('button')
    trashButton.classList.add('trash-button')

    trashButton.addEventListener('click', () => {
        if (confirmDelete() === true) {
            removeBookFromCompleted(id)
        }
    })

    if (isComplete) {
        const undoButton = document.createElement('button')
        undoButton.classList.add('undo-button')

        undoButton.addEventListener('click', () => {
            undoTaskFromCompleted(id)
        })

        container.append(undoButton, trashButton)
    } else {
        const checkButton = document.createElement('button')
        checkButton.classList.add('check-button')

        checkButton.addEventListener('click', () => {
            addTaskToCompleted(id)
        })

        container.append(checkButton, trashButton)
    }

    return container
}

const addTaskToCompleted = (bookId) => {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return

    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    toast('done')
}

const findBookIndex = (bookId) => {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }
    return -1
}

const findBook = (bookId) => {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null
}

const removeBookFromCompleted = (bookId) => {
    const bookTarget = findBookIndex(bookId)

    if (bookTarget === -1) return

    books.splice(bookTarget, 1)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    toast('delete')
}

const undoTaskFromCompleted = (bookId) => {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return

    bookTarget.isComplete = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    toast('back')
}

const saveData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

const SAVED_EVENT = 'saved-book'
const STORAGE_KEY = 'BOOKSHELF_APPS'

const isStorageExist = () => {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage')
        return false
    }
    return true
}

document.addEventListener(SAVED_EVENT, () => {
    const row = JSON.parse(localStorage.getItem(STORAGE_KEY))

})

const loadDataFromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY)
    let data = JSON.parse(serializedData)

    if (data !== null) {
        for (const book of data) {
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}

const toast = (status, found) => {
    found = found || 0
    let x = document.getElementById("toast");
    switch (status) {
        case 'add':
            x.innerText = "Berhasil menambahkan buku.."
            break;
        case 'done':
            x.innerText = "Selamat Anda telah menyelesaikan sebuah buku.."
            break;
        case 'search':
            x.innerText = `Sebanyak ${found} Buku ditemukan..`
            break;
        case 'back':
            x.innerText = `Buku dikembalikan ke rak 'belum dibaca'..`
            break;
        case 'delete':
            x.innerText = `Buku berhasil dihapus..`
            break;
        default:
            x.innerText = "Berhasil menambahkan buku.."
            break;
    }

    x.className = "show";

    setTimeout(() => {
        x.className = x.className.replace("show", "")
    }, 3000)
}

const confirmDelete = () => {
    if (confirm('Anda yakin menghapus buku ini?')) {
        return true
    } else {
        return false
    }
}