'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function copyMat(mat) {
    const copy = []
    for (var i = 0; i < mat.length; i++) {
        copy[i] = [...mat[i]]
    }
    return copy
}

function updateLife(life) {
    var res = ''
    const elLife = document.querySelector('.life')

    for (var i = 0; i < life; i++) {
        res += LIFE
    }

    elLife.innerHTML = res
}

function updateHint(hint) {
    var res = ''
    const elHint = document.querySelector('.hintBtn')

    for (var i = 0; i < hint; i++) {
        res += HINT
    }

    elHint.innerHTML = res
}

function updateSafe(safe) {
    var res = ''
    const elSafe = document.querySelector('.safeBtn')

    for (var i = 0; i < safe; i++) {
        res += SAFE
    }

    elSafe.innerHTML = res
}