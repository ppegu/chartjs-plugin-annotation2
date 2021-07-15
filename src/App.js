import Chart from "chart.js/auto";
import { createRef, useEffect } from "react";
import Annotation2 from "./chartjs-plugin-annotation2";

const App = () => {
   const chartRef = createRef();

   useEffect(() => {
      const config = {
         type: "line",
         data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [
               {
                  label: "# of Votes",
                  data: [12, 19, 3, 5, 2, 3],
                  backgroundColor: [
                     "rgba(255, 99, 132, 0.2)",
                     "rgba(54, 162, 235, 0.2)",
                     "rgba(255, 206, 86, 0.2)",
                     "rgba(75, 192, 192, 0.2)",
                     "rgba(153, 102, 255, 0.2)",
                     "rgba(255, 159, 64, 0.2)"
                  ],
                  borderColor: [
                     "rgba(255, 99, 132, 1)",
                     "rgba(54, 162, 235, 1)",
                     "rgba(255, 206, 86, 1)",
                     "rgba(75, 192, 192, 1)",
                     "rgba(153, 102, 255, 1)",
                     "rgba(255, 159, 64, 1)"
                  ],
                  borderWidth: 1
               }
            ]
         },
         options: {
            events: [
               // "mousemove",
               "mouseout",
               "click",
               "touchstart",
               "touchmove",
               "touchend"
            ],
            responsive: true,
            plugins: {
               annotation: {
                  annotations: [
                     {
                        id: "annotation1",
                        type: "box",
                        xMin: 1,
                        xMax: 2,
                        yMin: 0,
                        yMax: 20,
                        backgroundColor: "rgba(255, 99, 132, 0.25)",
                        click: function ({ chart, element }) {
                           console.log("Line annotation clicked");
                        },
                        touchmove: function () {
                           console.log("Line annotation clicked");
                        }
                     }
                  ]
               }
            }
         }
      };
      Chart.register([Annotation2]);
      let chart = new Chart(chartRef.current, config);
      return () => {
         chart.destroy();
      };
   }, [chartRef]);

   return (
      <div style={{ width: "500px", marginLeft: "100px", marginTop: "100px" }}>
         <canvas id="canvas" ref={chartRef} />
         <canvas id="canvas2" />
         <div id="output" />
      </div>
   );
};

export default App;
