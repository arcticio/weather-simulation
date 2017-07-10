
SIM.Charts = (function () {

  var 
    self,

    $$             = document.querySelectorAll.bind(document),

    chart, 
    container      = $$('div.panel.chart.container')[0],

    data = {
      example: [
        { label: 'apple',  y: 10  },
        { label: 'orange', y: 15  },
        { label: 'banana', y: 25  },
        { label: 'mango',  y: 30  },
        { label: 'grape',  y: 28  }
      ],
      
    }

  ;

  return self = {

    init: function () {

      chart = new CanvasJS.Chart(container, {
          title:{
            text: 'My First Chart in CanvasJS'              
          },
          data: [              
            {
              type: 'line',
              dataPoints: data.example
            }
          ]
        });

        // chart.render();

    },

    renderChart: function (cfg) {

      chart.render();

    },



  };


}());
