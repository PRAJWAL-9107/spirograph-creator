class SpirographDesigner {
    constructor() {
        this.canvas = document.getElementById('spirographCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initializeControls();
        this.setupEventListeners();
        this.clearCanvas();
        this.isDrawerOpen = true;
    }

    initializeControls() {
        this.controls = {
            outerRadius: document.getElementById('outerRadius'),
            innerRadius: document.getElementById('innerRadius'),
            distance: document.getElementById('distance'),
            resolution: document.getElementById('resolution'),
            lineWidth: document.getElementById('lineWidth'),
            strokeColor: document.getElementById('strokeColor'),
            useGradient: document.getElementById('useGradient'),
            gradientStart: document.getElementById('gradientStart'),
            gradientEnd: document.getElementById('gradientEnd'),
            backgroundColor: document.getElementById('backgroundColor')
        };

        this.buttons = {
            generate: document.getElementById('generateBtn'),
            clear: document.getElementById('clearBtn'),
            download: document.getElementById('downloadBtn')
        };

        this.elements = {
            drawer: document.getElementById('drawer'),
            drawerToggle: document.getElementById('drawerToggle'),
            mainContent: document.querySelector('.main-content'),
            canvasContainer: document.getElementById('canvasContainer'),
            fullscreenModal: document.getElementById('fullscreenModal'),
            closeFullscreen: document.getElementById('closeFullscreen'),
            fullscreenCanvas: document.getElementById('fullscreenCanvas')
        };

        this.presets = {
            flower: { outerRadius: 100, innerRadius: 40, distance: 50 },
            star: { outerRadius: 120, innerRadius: 45, distance: 80 },
            spiral: { outerRadius: 100, innerRadius: 95, distance: 100 },
            complex: { outerRadius: 150, innerRadius: 37, distance: 65 }
        };
    }

    setupEventListeners() {
        // Drawer toggle
        this.elements.drawerToggle.addEventListener('click', () => this.toggleDrawer());

        // Fullscreen functionality
        this.elements.canvasContainer.addEventListener('click', () => this.openFullscreen());
        this.elements.closeFullscreen.addEventListener('click', () => this.closeFullscreen());
        this.elements.fullscreenModal.addEventListener('click', (e) => {
            if (e.target === this.elements.fullscreenModal) {
                this.closeFullscreen();
            }
        });

        // Generate button
        this.buttons.generate.addEventListener('click', () => this.generateSpirograph());

        // Clear button
        this.buttons.clear.addEventListener('click', () => this.clearCanvas());

        // Download button
        this.buttons.download.addEventListener('click', () => this.downloadImage());

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPreset(e.target.dataset.preset));
        });

        // Real-time value updates
        Object.keys(this.controls).forEach(key => {
            if (key !== 'strokeColor' && key !== 'backgroundColor' && key !== 'gradientStart' && key !== 'gradientEnd') {
                this.controls[key].addEventListener('input', (e) => {
                    this.updateValueDisplay(e.target);
                });
            }
        });

        // Gradient toggle
        this.controls.useGradient.addEventListener('change', (e) => {
            this.toggleGradientControls(e.target.checked);
        });

        // Auto-generate on parameter change (optional)
        Object.keys(this.controls).forEach(key => {
            this.controls[key].addEventListener('change', () => {
                this.generateSpirograph();
            });
        });
    }

    updateValueDisplay(input) {
        const display = input.nextElementSibling;
        if (display && display.classList.contains('value-display')) {
            display.textContent = input.value;
        }
    }

    toggleDrawer() {
        this.isDrawerOpen = !this.isDrawerOpen;
        
        if (this.isDrawerOpen) {
            this.elements.drawer.classList.remove('collapsed');
            this.elements.drawerToggle.classList.remove('active');
            this.elements.mainContent.classList.remove('drawer-collapsed');
        } else {
            this.elements.drawer.classList.add('collapsed');
            this.elements.drawerToggle.classList.add('active');
            this.elements.mainContent.classList.add('drawer-collapsed');
        }
    }

    toggleGradientControls(show) {
        const gradientControls = document.getElementById('gradientControls');
        
        if (show) {
            gradientControls.style.display = 'block';
        } else {
            gradientControls.style.display = 'none';
        }
    }

    openFullscreen() {
        this.elements.fullscreenModal.classList.add('active');
        this.copyCanvasToFullscreen();
    }

    closeFullscreen() {
        this.elements.fullscreenModal.classList.remove('active');
    }

    copyCanvasToFullscreen() {
        const sourceCanvas = this.canvas;
        const targetCanvas = this.elements.fullscreenCanvas;
        const targetCtx = targetCanvas.getContext('2d');
        
        // Clear the fullscreen canvas
        targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        
        // Copy the current spirograph to fullscreen canvas
        targetCtx.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
    }

    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;

        Object.keys(preset).forEach(key => {
            if (this.controls[key]) {
                this.controls[key].value = preset[key];
                this.updateValueDisplay(this.controls[key]);
            }
        });

        this.generateSpirograph();
    }

    clearCanvas() {
        const bgColor = this.controls.backgroundColor.value;
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    generateSpirograph() {
        const R = parseFloat(this.controls.outerRadius.value);
        const r = parseFloat(this.controls.innerRadius.value);
        const d = parseFloat(this.controls.distance.value);
        const resolution = parseInt(this.controls.resolution.value);
        const lineWidth = parseFloat(this.controls.lineWidth.value);
        const strokeColor = this.controls.strokeColor.value;
        const useGradient = this.controls.useGradient.checked;
        const gradientStart = this.controls.gradientStart.value;
        const gradientEnd = this.controls.gradientEnd.value;

        // Clear canvas first
        this.clearCanvas();

        // Calculate center of canvas
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Generate spirograph points
        const points = [];
        const maxT = Math.PI * 2 * this.getLCM(R, r) / r;

        for (let i = 0; i <= resolution; i++) {
            const t = (i / resolution) * maxT;
            
            // Spirograph parametric equations
            const x = centerX + (R - r) * Math.cos(t) + d * Math.cos((R - r) * t / r);
            const y = centerY + (R - r) * Math.sin(t) - d * Math.sin((R - r) * t / r);
            
            points.push({ x, y, progress: i / resolution });
        }

        // Draw the spirograph
        if (points.length > 0) {
            if (useGradient) {
                this.drawGradientSpirograph(points, lineWidth, gradientStart, gradientEnd);
            } else {
                this.drawSolidSpirograph(points, lineWidth, strokeColor);
            }
        }

        // Update fullscreen canvas if modal is open
        if (this.elements.fullscreenModal.classList.contains('active')) {
            this.copyCanvasToFullscreen();
        }

        // Add visual feedback
        this.showGenerationComplete();
    }

    drawSolidSpirograph(points, lineWidth, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
    }

    drawGradientSpirograph(points, lineWidth, startColor, endColor) {
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw segments with gradient colors
        const segmentLength = Math.max(1, Math.floor(points.length / 100)); // Draw in segments for smooth gradient
        
        for (let i = 0; i < points.length - segmentLength; i += segmentLength) {
            const progress = i / points.length;
            const color = this.interpolateColor(startColor, endColor, progress);
            
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(points[i].x, points[i].y);
            
            for (let j = 1; j <= segmentLength && i + j < points.length; j++) {
                this.ctx.lineTo(points[i + j].x, points[i + j].y);
            }
            
            this.ctx.stroke();
        }
    }

    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getLCM(a, b) {
        return Math.abs(a * b) / this.getGCD(a, b);
    }

    getGCD(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    downloadImage() {
        // Create a temporary link element
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        
        // Set download attributes
        link.download = `spirograph-${timestamp}.png`;
        link.href = this.canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show feedback
        this.showDownloadComplete();
    }

    showGenerationComplete() {
        const canvas = this.canvas;
        canvas.classList.add('generating');
        
        setTimeout(() => {
            canvas.classList.remove('generating');
        }, 500);
    }

    showDownloadComplete() {
        const btn = this.buttons.download;
        const originalText = btn.textContent;
        btn.textContent = 'Downloaded!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpirographDesigner();
});

// Add some utility functions for advanced features
const SpirographUtils = {
    // Calculate interesting parameter combinations
    getInterestingParameters() {
        return [
            { outerRadius: 100, innerRadius: 33, distance: 65 }, // Creates 3-petal flower
            { outerRadius: 100, innerRadius: 25, distance: 75 }, // Creates 4-petal flower
            { outerRadius: 100, innerRadius: 20, distance: 80 }, // Creates 5-petal flower
            { outerRadius: 120, innerRadius: 40, distance: 90 }, // Creates star pattern
            { outerRadius: 100, innerRadius: 90, distance: 100 }, // Creates spiral
        ];
    },

    // Validate parameters
    validateParameters(R, r, d) {
        if (r >= R) {
            return { valid: false, message: "Inner radius must be smaller than outer radius" };
        }
        if (d < 0) {
            return { valid: false, message: "Distance must be positive" };
        }
        return { valid: true };
    },

    // Calculate pattern information
    getPatternInfo(R, r, d) {
        const gcd = this.getGCD(R, r);
        const petals = R / gcd;
        const isHypotrochoid = r > R / 2;
        
        return {
            petals: petals,
            type: isHypotrochoid ? 'Hypotrochoid' : 'Epitrochoid',
            symmetry: petals
        };
    },

    getGCD(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
};