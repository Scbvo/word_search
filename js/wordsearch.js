// Updated wordsearch.js script
(function(){
  'use strict';

  // Extend the element method
  Element.prototype.wordSearch = function(settings) {
    return new WordSearch(this, settings);
  }

  /**
   * Word Search Constructor
   *
   * @param {Element} wrapEl - The game's wrapper element
   * @param {Object} settings - Configuration settings
   */
  function WordSearch(wrapEl, settings) {
    this.wrapEl = wrapEl;
    this.wrapEl.classList.add('ws-area');

    // Default settings
    var default_settings = {
      directions: ['W', 'N', 'WN', 'EN'],
      gridSize: 18,
      words: [
        'THRONE', 'PALACE', 'TRADITION', 'FAMILY', 'DESCENT',
        'ROYAL', 'KINGDOM', 'PRINCE', 'LAW', 'EARL',
        'GOVERNMENT', 'CHARTER', 'SOVEREIGN', 'ORB', 'COMMONS'
      ],
      debug: false,
      condition: 0,
      same: true,
      test: false
    };

    // Merge user settings with default settings
    this.settings = Object.assign({}, default_settings, settings);

    // Initialize the game
    this.initialize();
  }

  // Additional methods for WordSearch would go here...
})();
