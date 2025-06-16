import './caesar.css';
import React, { useState, useEffect } from 'react';

import { Add, CaretUp, CaretDown, ColumnDelete, Reset } from '@carbon/icons-react';

// The list of characters we consider valid for input AND can be manipulated using the cipher
const VALID_CHARS = 'abcdefghijklmnopqrstuvwxyz';
// Addditional character we allow but won't be manipulated
const SPECIAL_CHARS = ' ';
// The range of possible values each cipher position can be set to
const CIPHER_SWAP_RANGE = [0, 9];
// The starting cipher as well as what we reset to
const DEFAULT_CIPHER = [1, 1, 1];
// We can insert decorator divider characters in between positions of the cipher. This allows us to make a cipher look like a time e.g. 9:14 to guide the player
const CIPHER_DIVIDERS = [':', ''];
// Flag to indicate whether you can add or remove cipher columns. During testing we decided that a fixed two structure was good without making it over complex
const ALLOW_CIPHER_COLS_CHANGE = false;

/**
 * This App will:
 * - Allow the user to manipulate a shift cipher
 * - Allow the user to enter characters based on an encoded message
 * - Attempt to decode the message based on the specified cipher
 *
 * A shift cipher has a number of columns, each one presenting by how many characters the code show shift the encoded character, e.g. a cipher of 1 will shift
 * the coded message by e.g. b->c, f->g. A cipher of 2,3, will shift the first character two positions, the second three positions, the third two position and
 * so on, e.g. ab->ce, lm->np
 */
function Caesar() {
  // Stores the encoded message that the user types in
  const [encMsg, setEncMsg] = useState([]);
  // Stores the integer cipher that use can manipulate
  const [cipher, setCipher] = useState([...DEFAULT_CIPHER]);
  // Array of integers storing how many 'ticks' of animation are remaining before we displayed the decoded character
  const [anims, setAnims] = useState([]);

  /**
   * Set up timer to manipulate the values within "anims". Every 100 ms we decrement the number of ticks for each character. Any number greater than zero
   * will results in a random character being displayed before displaying the actual decoded value. Gives the appearance through animation that the code
   * is actively decoding the message.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      let newAnims = anims.map(v => {
        if (v > 0) return v - 1;
        return 0;
      });
      setAnims(newAnims);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [anims, setAnims]);

  /**
   * Registers a global key up event handler with the page. One key press we extract the key, identify whether it's one of the characters we care
   * about and then adds it to the encoded message array. The delete key removes messages from the stack
   *
   * We also manipulate the anims array to add/remove animation based on incoming characters
   */
  useEffect(() => {
    const handleKeyUp = e => {
      if (e.key && e.key.toLowerCase && (VALID_CHARS.indexOf(e.key.toLowerCase()) >= 0 || SPECIAL_CHARS.indexOf(e.key.toLowerCase()) >= 0)) {
        encMsg.push(e.key.toUpperCase());
        setEncMsg(encMsg);

        anims.push(10);
        setAnims(anims);
      } else if (e.keyCode === 8 || e.keyCode === 46) {
        encMsg.pop();
        setEncMsg(encMsg);

        anims.pop();
        setAnims(anims);
      }
    };

    window.document.addEventListener('keyup', handleKeyUp);
    return () => {
      window.document.removeEventListener('keyup', handleKeyUp);
    };
  }, [encMsg, setEncMsg, anims, setAnims]);

  let cipherPos = 0;
  /**
   * Decodeds the encoded message based on the index / column position within the cipher
   * @param {*} idx
   * @returns
   */
  const getDecodedChar = idx => {
    // Are we still animating?
    if (anims[idx] === 0) {
      // Get the index of the encoded message string within the valid chars array and manipulate it along based on the cipher at this current column
      let newIdx = (VALID_CHARS.indexOf(encMsg[idx].toLowerCase()) + cipher[cipherPos]) % VALID_CHARS.length;
      // If the new index within the valid chars aray is less than 0 (due to negative cipher columns) then wrap around
      if (newIdx < 0) newIdx += VALID_CHARS.length;
      let newV = VALID_CHARS[newIdx].toUpperCase();
      // Move the column position within the cipher along one and wrap back to the start if we're at the end
      cipherPos++;
      if (cipherPos >= cipher.length) cipherPos = 0;
      // Return the translated character
      return newV;
    } else {
      // If the animation indicates we're still animating then display a random valid character
      return VALID_CHARS[Math.floor(Math.random() * VALID_CHARS.length)].toUpperCase();
    }
  };

  /**
   * Inner functional component to generate an icon button that performs an action on the cipher spec based on the index (column) within the overall spec
   * @param {*} idx Index / column position that this button represents within the cipher
   * @param {*} action Action id that this button will trigger
   * @returns
   */
  const genCipherActionBtn = (idx, action) => {
    // Mapping from action id to Carbon Icon to display
    const actionIconMap = { inc: CaretUp, dec: CaretDown, add: Add, del: ColumnDelete, reset: Reset };
    const IconElm = actionIconMap[action];
    return (
      <IconElm
        size='32'
        className='btn'
        onClick={evt => {
          let output = [...cipher];
          switch (action) {
            case 'inc':
              // Increases how many characters this position in the cipher changes
              output[idx]++;
              if (output[idx] > CIPHER_SWAP_RANGE[1]) output[idx] = CIPHER_SWAP_RANGE[1];
              break;
            case 'dec':
              // Decreases how many characters this position in the cipher changes
              output[idx]--;
              if (output[idx] < CIPHER_SWAP_RANGE[0]) output[idx] = CIPHER_SWAP_RANGE[0];
              break;
            case 'add':
              // Add a new column to the end of the cipher
              output.push(1);
              break;
            case 'del':
              // Delete the last column at the end of the cipher
              output.pop();
              break;
            case 'reset':
              // Resets the whole cipher to default
              output = [...DEFAULT_CIPHER];
              break;
            default:
              break;
          }

          setCipher(output);
          setAnims(anims.map(_ => 10));
          if (action === 'reset') {
            setEncMsg([]);
          }
        }}
      />
    );
  };

  return (
    <div className='caesar'>
      <video
        id='bgVideo'
        className='videoContent'
        autoPlay
        loop
        muted
        onLoadStart={() => {
          const videoElm = document.getElementById('bgVideo');
          videoElm.playbackRate = 0.5;
          if (window.location.search === '?static') {
            videoElm.pause();
          }
        }}
      >
        <source src='type.mp4' type='video/mp4' />
      </video>
      <div id='bgVideoOverlay' className='videoContent' />
      <header className='App-header'>
        <p>Cipher Decoder</p>
      </header>
      <div className='msgLine cipher'>
        {cipher.map((c, idx) => (
          <>
            <div key={idx} className='encChar'>
              {genCipherActionBtn(idx, 'inc')}
              {`${c >= 0 ? '+' : ''}${c}`}
              {genCipherActionBtn(idx, 'dec')}
            </div>
            {CIPHER_DIVIDERS?.length >= 0 && idx < CIPHER_DIVIDERS?.length && CIPHER_DIVIDERS[idx] && (
              <div key={idx + 'divider'} className='encChar encChar--divider'>
                {CIPHER_DIVIDERS[idx]}
              </div>
            )}
          </>
        ))}
        <span className='actions'>
          {ALLOW_CIPHER_COLS_CHANGE && genCipherActionBtn(0, 'add')}
          {ALLOW_CIPHER_COLS_CHANGE && cipher.length > 1 && genCipherActionBtn(0, 'del')}
          {genCipherActionBtn(0, 'reset')}
        </span>
      </div>
      <header className='App-header'>
        <p>Input</p>
      </header>
      <div className='msgLine input'>
        {encMsg.map((c, idx) => (
          <div key={idx} className={`encChar ${c === ' ' ? 'spaceChar' : ''}`}>
            {c}
          </div>
        ))}
        <div className='encChar empty'>
          <div className='cursor'>_</div>
        </div>
      </div>
      <header className='App-header'>
        <p>Output</p>
      </header>
      <div className={`msgLine output ${encMsg.length > 0 ? 'cursorPad' : ''}`}>
        {encMsg.length === 0 ? (
          <div className='encChar empty'>?</div>
        ) : (
          encMsg.map((c, idx) => {
            return (
              <div key={idx} className={`encChar ${c === ' ' ? 'spaceChar' : ''}`}>
                {getDecodedChar(idx)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Caesar;
