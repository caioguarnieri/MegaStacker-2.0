let Stackers = 
   (function() {
      let row1 = 15; 			 // ALTERA O NUMERO DE LINAS DO JOGO.
      let columns = 10; 		    // ALTERA O NUMERO DE COLUNAS DO JOGO. 
      let squareSize = 30;		 // ALTERA A DISTANCIA ENTRE UM QUADRINHO E OUTRO.
      let loadingState = 0; 
      let loseState = 1;
      let playingState = 2;
      let twoDots = 6;
      let oneDot = 3;
      let slowMove = 150;
      let moveDecrement = 7;
      let runnerColor = "red";  //MUDA A COR DA BARRA INICIAL
      let pauseTimeOut = 500;
      let flashTimeOut = 0;
      let STATE = loadingState;// int
      let movingDelay;
      let dots;
      let lastTimeout = -1;

      let setAttribute = function(elt,att,value) {
         elt.setAttribute(att, value);
         elt[att] = value;
      };

      let setClass = function(elt,value) {
          setAttribute(elt,"class",value);
          setAttribute(elt,"className",value);
      };

      let gebi = function(id) {
         return document.getElementById(id);
      };

      let setStatus = function(str) {
         let status = gebi("status");
         if (status.firstChild)
            status.removeChild(status.firstChild);
         status.appendChild(document.createTextNode(str));
      }
      let setStartButton = function(active) {
         
      };

      let setSquareColor = function(r,c,color) {
         dots[r][c].style.backgroundColor = color;
      };

      let displayBarRow = function(bar) {
         for (let i = 0; i < columns; i++) {
            if (i >= bar.column && i < bar.column+bar.width) {
               setSquareColor(bar.row, i, runnerColor);
            } else {
               setSquareColor(bar.row, i, "#33ffe7");
            }
         }
      };
      let moveBar = function() {
         if (STATE != playingState)
            return;
         
         if (runner.left) {
            if (runner.column==0) {
               runner.left = false;
               runner.column++;
            } else {
               runner.column--;
            }
         } else {
            if (runner.column+runner.width >= columns) {
               runner.left = true;
               runner.column--;
            } else {
               runner.column++;
            }
         }

         displayBarRow(runner);
         lastTimeout = setTimeout(moveBar, movingDelay);
      };
      
      let lose = function() {
         STATE = loseState;
         alert ("YOU LOSE :( ");
         window.location.reload();
         setStartButton(true);
      };
      let win = function() {
         STATE = loseState;
         alert ("YOU WIN !");
         window.location.reload();
         setStartButton(true);
      };

      let pauseAndMoveUp = function() {
         let called = function() {
            runner.row--;
            movingDelay -= moveDecrement;
            lastTimeout = setTimeout(moveBar, movingDelay);
         };
         lastTimeout = setTimeout(called, pauseTimeOut);
      };

      let flashDieDots = function(iterations, DieDots, called) {
         return function() {
            if (iterations == 0) {
               for (let i = 0; i < DieDots.length; i++) {
                  setSquareColor(DieDots[i].row, DieDots[i].column, "#33ffe7"); //MUDA A COR DOS QUADRADOS MORTOS PARA BRANCO
               }
               lastTimeout = setTimeout(called, flashTimeOut);
               return;
            } else {
               let color = (iterations%2==0) ? runnerColor : "#33ffe7";
               for (let i = 0; i < DieDots.length; i++) {
                  setSquareColor(DieDots[i].row, DieDots[i].column, color);
               }
               lastTimeout = setTimeout(flashDieDots(iterations-1, DieDots, called), flashTimeOut);
               return;
            } 
         };
      };

      let flashAndMoveUp = function() {
         let newwidth = 0;
         let newcolumn = -1;
         let DieDots = [];
         for (let i = 0; i < runner.width; i++) {
            if (filled[runner.row+1][runner.column+i]) {
               newwidth++;
               if (newcolumn==-1)
                  newcolumn = runner.column+i;
            } else {
               DieDots.push({row:runner.row, column:runner.column+i});
            }
         }

         let called = function() {
            runner.width = newwidth;
            runner.row--;
            if (runner.row == twoDots)
               runner.width = Math.min(2,runner.width);
            if (runner.row == oneDot)
               runner.width = Math.min(1,runner.width);
            movingDelay -= moveDecrement;
            displayBarRow(runner);
            lastTimeout = setTimeout(moveBar, movingDelay);
         };

        if (DieDots.length > 0) {
            lastTimeout = setTimeout(flashDieDots(5,DieDots,called));
         } else {
            // no flashing
          lastTimeout = setTimeout(called, pauseTimeOut);            
         }
      };

      let dropBar = function() {
         if (STATE != playingState)
            return;
         if (lastTimeout != -1)
            clearTimeout(lastTimeout);

         if (runner.row == row1-1) {
            for (let i = 0; i < runner.width; i++) {
               filled[runner.row][runner.column+i] = true;
            }
            displayBarRow(runner);
            pauseAndMoveUp();
            return;
         } else {
            let anyBelow = false;
            for (let i = 0; i < runner.width; i++) {
               if (filled[runner.row+1][runner.column+i]) {
                  anyBelow = true;
                  break;
               }
            }
            if (anyBelow) {
               if (runner.row == 0) {
                  win();
               } else {
                  for (let i = 0; i < runner.width; i++) {
                     if (filled[runner.row+1][runner.column+i]) {
                        filled[runner.row][runner.column+i] = true;
                     }
                  }
                  flashAndMoveUp();
               }
            } else {
               lose();
            }
            return;
         }
      };
      let keyHandler = function(e) {
         let keynum;
         if (e.keyCode) {
            keynum = e.keyCode;
         } else if (window.event.keyCode) {
            keynum = window.event.keyCode;
            e = window.event;
         }
         
         if (keynum == 32) { // BARRA DE ESPACO
            if (e.preventDefault)
               e.preventDefault();
            if (e.stopPropagation)
               e.stopPropagation();

            if (STATE != playingState)
               return true;

            dropBar();
            return false;
         }
         return false;
      };

      let setup = function() {
         LEVEL = 0;
         movingDelay = slowMove;
         runner = {row:row1-1, column:1, width:3, left:false};
         filled = [];
         for (let r = 0; r < row1; r++) {
            let row = [];
            filled.push(row);
            for (let c = 0; c < columns; c++) {
               row.push(false);
               setSquareColor(r,c,"white");
            }
         }
         STATE = playingState;
         setStartButton(false);
         gebi("windiv").style.visibility = "hidden";
         gebi("losediv").style.visibility = "hidden";

         lastTimeout = setTimeout(moveBar, movingDelay);
      };

      

      let startButtonClick = function(e) {
         if (STATE == playingState)
            return false;
         gebi("startbutton").blur();
         setup();
      };

      let init = function(squaresdiv) {
         if (document.attachEvent) {
            document.attachEvent("onkeydown", keyHandler);
            gebi("startbutton").attachEvent("onclick", startButtonClick);
         } else if (document.addEventListener) {
            document.addEventListener("keydown", keyHandler, true);
            gebi("startbutton").addEventListener("click", startButtonClick, true);
         }        
         let WIDTH = (columns*(squareSize+2));
         let HEIGHT = (row1*(squareSize+2));
         squaresdiv.style.width = WIDTH + "px";
         squaresdiv.style.height = HEIGHT + "px";
         dots = [];
         
         for (let i = 0; i < row1; i++) {
            let row = [];
            dots.push(row);
            for (let j = 0; j < columns; j++) {
               let div = document.createElement("DIV");
               setAttribute(div,"id","square_" + i + "_" + j);
               if (i==0)
                  setClass(div, "square majorprize");
               else if (i==4)
                  setClass(div, "square minorprize");
               else
                  setClass(div,"square");
               div.style.top = (i*(squareSize+2)) + "px";
               div.style.left = (j*(squareSize+2)) + "px";
               squaresdiv.appendChild(div);
               row.push(div);
            }
         }
      };
      let result = {
         row1 : row1,
         columns : columns,
         init : init
      };
      return result;
   })();
