import $ from "jquery";
import { distanceBetweenPoints, callback as callHandler } from "chart.js/helpers";

const clickHooks = ["click", "dblclick"];
const moveHooks = ["enter", "leave"];
export const hooks = clickHooks.concat(moveHooks);

export function updateListeners(chart, state, options) {
   const annotations = state.annotations || [];
   state.listened = false;
   state.moveListened = false;

   hooks.forEach((hook) => {
      if (typeof options[hook] === "function") {
         state.listened = true;
         state.listeners[hook] = options[hook];
      }
   });
   moveHooks.forEach((hook) => {
      if (typeof options[hook] === "function") {
         state.moveListened = true;
      }
   });

   if (!state.listened || !state.moveListened) {
      annotations.forEach((scope) => {
         if (!state.listened) {
            clickHooks.forEach((hook) => {
               if (typeof scope[hook] === "function") {
                  state.listened = true;
               }
            });
         }
         if (!state.moveListened) {
            moveHooks.forEach((hook) => {
               if (typeof scope[hook] === "function") {
                  state.listened = true;
                  state.moveListened = true;
               }
            });
         }
      });
   }
}

export function handleMouseDown(chart, state, options) {
   const canvas = chart.canvas;
   let ctx = chart.ctx;

   let canvasx = $(canvas).offset().left;
   let canvasy = $(canvas).offset().top;
   let last_mousex = 0;
   let last_mousey = 0;
   let mousex = 0;
   let mousey = 0;
   let mousedown = 0;

   $("#canvas")
      .mousedown(function (e) {
         // console.log("mousedown");
         mousedown = true;
      })
      .mouseup(function (e) {
         mousedown = false;
      })
      .mouseleave(function (e) {
         console.log("leave");
      });

   $(canvas).on("mousedown", (e) => {
      last_mousex = parseInt(e.clientX - canvasx);
      last_mousey = parseInt(e.clientY - canvasy);
      mousedown = true;

      $(canvas).on("mouseup", function (e) {
         mousedown = false;

         chart.options.plugins.annotation.annotations[0].xMin = Math.floor(
            Math.random() * 3
         );
         chart.options.plugins.annotation.annotations[0].xMax = Math.floor(
            Math.random() * 9
         );
         chart.options.plugins.annotation.annotations[0].yMin = Math.floor(
            Math.random() * 6
         );
         chart.options.plugins.annotation.annotations[0].yMax = Math.floor(
            Math.random() * 21
         );
         chart.update();
      });

      $(canvas).on("mousemove", function (e) {
         mousex = parseInt(e.clientX - canvasx);
         mousey = parseInt(e.clientY - canvasy);
         if (mousedown) {
            ctx.beginPath();
            var width = mousex - last_mousex;
            var height = mousey - last_mousey;
            ctx.rect(last_mousex, last_mousey, width, height);
            ctx.fillStyle = "rgba(164, 221, 249, 0.3)";
            ctx.fill();
            ctx.strokeStyle = "#1B9AFF";
            ctx.lineWidth = 1;
            ctx.fillRect(last_mousex, last_mousey, width, height);
            ctx.stroke();
            ctx.closePath();

            console.log(last_mousex, last_mousey);
            console.log(width, height);
            console.log(state);
         }
      });

      //
   });
}

export function handleEvent(chart, state, event, options) {
   if (state.listened) {
      switch (event.type) {
         case "mousedown":
            handleMouseDown(chart, state, event);
            break;
         case "mousemove":
            handleMoveEvents(chart, state, event);
            break;
         case "mouseout":
            handleMoveEvents(chart, state, event);
            break;
         case "click":
            handleClickEvents(chart, state, event, options);
            break;
         default:
      }
   }
}

function handleMoveEvents(chart, state, event) {
   if (!state.moveListened) {
      return;
   }

   let element;

   if (event.type === "mousemove") {
      element = getNearestItem(state.elements, event);
   }

   const previous = state.hovered;
   state.hovered = element;
   dispatchMoveEvents(chart, state, previous, element);
}

function dispatchMoveEvents(chart, state, previous, element) {
   if (previous && previous !== element) {
      dispatchEvent(
         chart,
         state,
         previous.options.leave || state.listeners.leave,
         previous
      );
   }
   if (element && element !== previous) {
      dispatchEvent(
         chart,
         state,
         element.options.enter || state.listeners.enter,
         element
      );
   }
}

function handleClickEvents(chart, state, event, options) {
   const listeners = state.listeners;
   const element = getNearestItem(state.elements, event);
   if (element) {
      const elOpts = element.options;
      const dblclick = elOpts.dblclick || listeners.dblclick;
      const click = elOpts.click || listeners.click;
      if (element.clickTimeout) {
         // 2nd click before timeout, so its a double click
         clearTimeout(element.clickTimeout);
         delete element.clickTimeout;
         dispatchEvent(chart, state, dblclick, element);
      } else if (dblclick) {
         // if there is a dblclick handler, wait for dblClickSpeed ms before deciding its a click
         element.clickTimeout = setTimeout(() => {
            delete element.clickTimeout;
            dispatchEvent(chart, state, click, element);
         }, options.dblClickSpeed);
      } else {
         // no double click handler, just call the click handler directly
         dispatchEvent(chart, state, click, element);
      }
   }
}

function dispatchEvent(chart, _state, handler, element) {
   callHandler(handler, [{ chart, element }]);
}

function getNearestItem(elements, position) {
   let minDistance = Number.POSITIVE_INFINITY;

   return elements
      .filter(
         (element) => element.options.display && element.inRange(position.x, position.y)
      )
      .reduce((nearestItems, element) => {
         const center = element.getCenterPoint();
         const distance = distanceBetweenPoints(position, center);

         if (distance < minDistance) {
            nearestItems = [element];
            minDistance = distance;
         } else if (distance === minDistance) {
            // Can have multiple items at the same distance in which case we sort by size
            nearestItems.push(element);
         }

         return nearestItems;
      }, [])
      .sort((a, b) => a._index - b._index)
      .slice(0, 1)[0]; // return only the top item
}
