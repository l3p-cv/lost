How to develop frontend
****************
The Frontend is developed with React, Redux, CoreUI and reactstrap

1. To start developing frontend follow the :ref:`LOST QuickSetup <quick-setup>` instruction.
2. Change directory to the frontend folder and install npm packages
 .. code-block:: bash

        cd lost/frontend/lost/
        npm i
3. [Optional] Set backend port in package.json start script with REACT_APP_PORT variable.
4. Start development server with 
 .. code-block:: bash

        npm start



.. list-table:: Frontend Applications
   :widths: 100 100
   :header-rows: 1

   * - Application
     - Directory
   * - Dashboard
     - src/components/Dashboard
   * - SIA (Single Image Annotation)
     - src/components/SIA
   * - MIA (Multi Image Annotation)
     - src/components/MIA
   * - Running Pipeline
     - src/components/pipeline/src/running
   * - Start Pipeline
     - src/components/pipeline/src/start
   * - Labels
     - src/components/Labels
   * - Workers
     - src/components/Workers
   * - Users
     - src/components/Users