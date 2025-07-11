#!/bin/bash
# Deployment automation script

set -e  # Exit on any error

echo "🚀 TaskTracker+ Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Function to build and test locally
build_local() {
    print_status "Building local development environment..."
    docker-compose --profile dev up --build -d
    
    print_status "Waiting for services to start..."
    sleep 10
    
    print_status "Testing backend health..."
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        print_success "Backend is healthy!"
    else
        print_error "Backend health check failed"
        docker-compose logs backend
        return 1
    fi
    
    print_status "Testing frontend..."
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend is accessible!"
    else
        print_warning "Frontend might still be loading..."
    fi
    
    print_success "Local environment is ready!"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend: http://localhost:5000"
    echo "❤️ Health Check: http://localhost:5000/api/health"
}

# Function to build production version
build_production() {
    print_status "Building production version..."
    
    # Build backend
    print_status "Building backend Docker image..."
    docker build -t tasktracker-backend ./server
    
    # Build frontend
    print_status "Building frontend for production..."
    cd client
    
    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        print_warning "Creating .env.production - please update with your backend URL"
        echo "VITE_API_URL=https://your-render-backend-url.onrender.com/api" > .env.production
    fi
    
    npm run build
    cd ..
    
    print_success "Production build complete!"
    print_status "Frontend build is in client/dist/"
}

# Function to prepare for Render deployment
prepare_render() {
    print_status "Preparing for Render deployment..."
    
    # Check if health route exists in server
    if [ ! -f "server/routes/health.js" ]; then
        print_warning "Health route not found. Please add the health check route to your server."
    fi
    
    # Check package.json scripts
    if grep -q '"start"' server/package.json; then
        print_success "Start script found in package.json"
    else
        print_error "No start script found in server/package.json"
        return 1
    fi
    
    print_success "Ready for Render deployment!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Create new Web Service on Render"
    echo "3. Connect your GitHub repo"
    echo "4. Set root directory to 'server'"
    echo "5. Add environment variables from .env.production"
    echo "6. Deploy!"
}

# Function to copy frontend to portfolio
copy_to_portfolio() {
    read -p "Enter path to your portfolio directory: " PORTFOLIO_PATH
    
    if [ ! -d "$PORTFOLIO_PATH" ]; then
        print_error "Portfolio directory not found: $PORTFOLIO_PATH"
        return 1
    fi
    
    # Create tasktracker directory if it doesn't exist
    mkdir -p "$PORTFOLIO_PATH/tasktracker"
    
    # Copy built files
    print_status "Copying frontend build to portfolio..."
    cp -r client/dist/* "$PORTFOLIO_PATH/tasktracker/"
    
    print_success "Frontend copied to portfolio!"
    print_status "Don't forget to update your vercel.json with the rewrite rules"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) 🏠 Build and run local development"
    echo "2) 🏭 Build production version"
    echo "3) ☁️ Prepare for Render deployment"
    echo "4) 📁 Copy frontend to portfolio"
    echo "5) 🧹 Clean up Docker resources"
    echo "6) 📊 Show logs"
    echo "7) ❌ Exit"
    echo ""
}

# Clean up function
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down
    docker system prune -f
    print_success "Cleanup complete!"
}

# Show logs
show_logs() {
    echo "Choose which logs to view:"
    echo "1) Backend logs"
    echo "2) Frontend logs"
    echo "3) All logs"
    read -p "Enter choice [1-3]: " log_choice
    
    case $log_choice in
        1) docker-compose logs backend ;;
        2) docker-compose logs frontend-dev ;;
        3) docker-compose logs ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Main script logic
while true; do
    show_menu
    read -p "Enter choice [1-7]: " choice
    
    case $choice in
        1) build_local ;;
        2) build_production ;;
        3) prepare_render ;;
        4) copy_to_portfolio ;;
        5) cleanup ;;
        6) show_logs ;;
        7) 
            print_success "Thanks for using TaskTracker+ deployment script!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done