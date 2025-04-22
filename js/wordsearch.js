(function(){
  'use strict';

  Element.prototype.wordSeach = function(settings) {
    return new WordSeach(this, settings);
  }

  function WordSeach(wrapEl, settings) {
    this.wrapEl = wrapEl;
    this.wrapEl.classList.add('ws-area');

    const default_settings = {
      directions: ['W', 'N', 'WN', 'EN', 'SW', 'NE', 'S', 'E'],
      gridSize: 12,
      words: [],
      debug: false,
      condition: 0,
      same: false,
      test: false
    };

    this.settings = Object.assign({}, default_settings, settings);

    if (this.parseWords(this.settings.gridSize)) {
      let isWorked = false;

      while (!isWorked) {
        this.initialize();
        if (this.settings.same) {
          isWorked = this.bobmatrix(this.settings.gridSize);
        } else {
          isWorked = this.addWords();
        }
      }

      if (!this.settings.debug && !this.settings.test) {
        this.fillUpFools();
      }

      this.drawmatrix();
      const currentScore = score();
      document.getElementById("score").innerHTML = "Mots trouvés : " + currentScore + " sur " + this.settings.words.length;
    }
  }

  WordSeach.prototype.parseWords = function(maxSize) {
    let itWorked = true;
    for (let i = 0; i < this.settings.words.length; i++) {
      this.settings.words[i] = this.settings.words[i].toUpperCase();
      if (this.settings.words[i].length > maxSize) {
        alert('Le mot `' + this.settings.words[i] + '` est trop long pour la grille.');
        itWorked = false;
      }
    }
    return itWorked;
  }

  WordSeach.prototype.initialize = function() {
    this.matrix = [];
    this.selectFrom = null;
    this.selected = [];

    for (let row = 0; row < this.settings.gridSize; row++) {
      this.matrix[row] = [];
      for (let col = 0; col < this.settings.gridSize; col++) {
        this.matrix[row][col] = { letter: '.', row: row, col: col };
      }
    }
  }

  WordSeach.prototype.addWords = function() {
    let counter = 0;
    let keepGoing = true;
    let isWorked = true;

    while (keepGoing) {
      const dir = this.settings.directions[Math.floor(Math.random() * this.settings.directions.length)];
      const result = this.addWord(this.settings.words[counter], dir);
      if (!result) {
        keepGoing = false;
        isWorked = false;
      }
      counter++;
      if (counter >= this.settings.words.length) {
        keepGoing = false;
      }
    }

    return isWorked;
  }

  WordSeach.prototype.addWord = function(word, direction) {
    const directions = {
      'W': [0, 1],
      'N': [1, 0],
      'WN': [1, 1],
      'EN': [1, -1],
      'E': [0, -1],
      'S': [-1, 0],
      'SW': [-1, -1],
      'NE': [-1, 1]
    };

    let row, col;
    switch (direction) {
      case 'W':
        row = Math.floor(Math.random() * this.settings.gridSize);
        col = Math.floor(Math.random() * (this.settings.gridSize - word.length));
        break;
      case 'N':
        row = Math.floor(Math.random() * (this.settings.gridSize - word.length));
        col = Math.floor(Math.random() * this.settings.gridSize);
        break;
      default:
        row = Math.floor(Math.random() * (this.settings.gridSize - word.length));
        col = Math.floor(Math.random() * (this.settings.gridSize - word.length));
    }

    let itWorked = true;
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * directions[direction][0];
      const newCol = col + i * directions[direction][1];
      if (!this.matrix[newRow] || !this.matrix[newRow][newCol]) return false;

      const origin = this.matrix[newRow][newCol].letter;
      if (origin !== '.' && origin !== word[i]) {
        itWorked = false;
      }
    }

    if (!itWorked) return false;

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * directions[direction][0];
      const newCol = col + i * directions[direction][1];
      this.matrix[newRow][newCol].letter = word[i];
    }

    return true;
  }

  WordSeach.prototype.fillUpFools = function() {
    for (let row = 0; row < this.settings.gridSize; row++) {
      for (let col = 0; col < this.settings.gridSize; col++) {
        if (this.matrix[row][col].letter === '.') {
          this.matrix[row][col].letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
  }

  WordSeach.prototype.drawmatrix = function() {
    for (let row = 0; row < this.settings.gridSize; row++) {
      const divEl = document.createElement('div');
      divEl.classList.add('ws-row');
      this.wrapEl.appendChild(divEl);

      for (let col = 0; col < this.settings.gridSize; col++) {
        const cvEl = document.createElement('canvas');
        cvEl.classList.add('ws-col');
        cvEl.width = 25;
        cvEl.height = 25;

        const ctx = cvEl.getContext('2d');
        ctx.font = '400 18px Calibri';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.fillText(this.matrix[row][col].letter, 12.5, 12.5);

        cvEl.addEventListener('mousedown', this.onMousedown(this.matrix[row][col]));
        cvEl.addEventListener('mouseover', this.onMouseover(this.matrix[row][col]));
        cvEl.addEventListener('mouseup', this.onMouseup());

        divEl.appendChild(cvEl);
      }
    }
  }

  WordSeach.prototype.onMousedown = function(item) {
    const _this = this;
    return function() {
      _this.selectFrom = item;
    }
  }

  WordSeach.prototype.onMouseover = function(item) {
    const _this = this;
    return function() {
      if (_this.selectFrom) {
        _this.selected = _this.getItems(_this.selectFrom.row, _this.selectFrom.col, item.row, item.col);
        _this.clearHighlight();
        for (const current of _this.selected) {
          const el = document.querySelector(`.ws-area .ws-row:nth-child(${current.row + 1}) .ws-col:nth-child(${current.col + 1})`);
          if (el) el.classList.add('ws-selected');
        }
      }
    }
  }

  WordSeach.prototype.onMouseup = function() {
    const _this = this;
    return function() {
      _this.clearHighlight();
      _this.lookup(_this.selected);
      _this.selected = [];
    }
  }

  WordSeach.prototype.getItems = function(rowFrom, colFrom, rowTo, colTo) {
    const items = [];
    const shiftY = rowTo === rowFrom ? 0 : (rowTo > rowFrom ? 1 : -1);
    const shiftX = colTo === colFrom ? 0 : (colTo > colFrom ? 1 : -1);

    let row = rowFrom, col = colFrom;
    while (true) {
      if (!this.matrix[row] || !this.matrix[row][col]) break;
      items.push(this.matrix[row][col]);
      if (row === rowTo && col === colTo) break;
      row += shiftY;
      col += shiftX;
    }

    return items;
  }

  WordSeach.prototype.clearHighlight = function() {
    document.querySelectorAll('.ws-selected').forEach(el => el.classList.remove('ws-selected'));
  }

  WordSeach.prototype.lookup = function(selected) {
    const word = selected.map(item => item.letter).join('');
    const reversed = word.split('').reverse().join('');
    const found = this.settings.words.includes(word) || this.settings.words.includes(reversed);

    if (found) {
      const li = document.getElementById(word) || document.getElementById(reversed);
      if (li && li.getAttribute('text-decoration') !== 'line-through') {
        li.style.textDecoration = 'line-through';
        li.setAttribute('text-decoration', 'line-through');
        document.getElementById("score").innerHTML = "Mots trouvés : " + score() + " sur " + this.settings.words.length;
      }

      selected.forEach(cell => {
        const el = document.querySelector(`.ws-area .ws-row:nth-child(${cell.row + 1}) .ws-col:nth-child(${cell.col + 1})`);
        if (el) el.classList.add('ws-found');
      });
    }
  }
})();
