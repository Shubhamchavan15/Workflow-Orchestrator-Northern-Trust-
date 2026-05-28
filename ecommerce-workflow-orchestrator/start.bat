@echo off
setlocal

set ROOT=C:\Users\Vaishnavi\Downloads\Workflow-Orchestrator-Northern-Trust-\Workflow-Orchestrator-Northern-Trust-\ecommerce-workflow-orchestrator

echo ============================================
echo  Ecommerce Workflow Orchestrator - Startup
echo ============================================
echo.

echo [1/7] Starting Payment Service on port 8001...
start "Payment Service" cmd /k cd /d %ROOT%\payment-service ^& python -m pip install -r requirements.txt -q ^& python -m uvicorn app.main:app --port 8001 --reload
timeout /t 2 /nobreak >nul

echo [2/7] Starting Inventory Service on port 8002...
start "Inventory Service" cmd /k cd /d %ROOT%\inventory-service ^& python -m pip install -r requirements.txt -q ^& python -m uvicorn app.main:app --port 8002 --reload
timeout /t 2 /nobreak >nul

echo [3/7] Starting Shipping Service on port 8003...
start "Shipping Service" cmd /k cd /d %ROOT%\shipping-service ^& python -m pip install -r requirements.txt -q ^& python -m uvicorn app.main:app --port 8003 --reload
timeout /t 2 /nobreak >nul

echo [4/7] Starting Notification Service on port 8004...
start "Notification Service" cmd /k cd /d %ROOT%\notification-service ^& python -m pip install -r requirements.txt -q ^& python -m uvicorn app.main:app --port 8004 --reload
timeout /t 3 /nobreak >nul

echo [5/7] Starting Orchestrator Backend on port 8000...
start "Orchestrator Backend" cmd /k cd /d %ROOT%\orchestrator-backend ^& python -m pip install -r requirements.txt -q ^& python -m uvicorn app.main:app --port 8000 --reload
timeout /t 3 /nobreak >nul

echo [6/7] Starting Admin Dashboard on port 5173...
start "Admin Dashboard" cmd /k cd /d %ROOT%\frontend-dashboard ^& npm install ^& npm run dev
timeout /t 2 /nobreak >nul

echo [7/7] Starting User Portal on port 5174...
start "User Portal" cmd /k cd /d %ROOT%\frontend-user ^& npm install ^& npm run dev

echo.
echo ============================================
echo  All services started!
echo.
echo  Admin Dashboard : http://localhost:5173
echo  User Portal     : http://localhost:5174
echo  API Docs        : http://localhost:8000/docs
echo ============================================
echo.
pause
