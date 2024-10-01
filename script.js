window.onload = function() {
    const canvas = document.getElementById('switch');
    const ctx = canvas.getContext('2d');
    const backgroundImage = document.querySelector('.background-image');
    const fireSound = document.getElementById('fire-sound');

    const switchWidth = 300;
    const switchHeight = 150;
    const circleRadius = 50;
    let isOn = false;
    let temperature = 0; 
    let idealTemperature = 0; 

    updateTemperatureDisplay();

    function drawSwitch() {
        ctx.clearRect(0, 0, switchWidth, switchHeight);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, switchWidth, switchHeight);

        const circleX = isOn ? switchWidth - circleRadius - 10 : circleRadius + 10;
        const circleColor = isOn ? 'green' : 'red';

        ctx.fillStyle = circleColor;
        ctx.beginPath();
        ctx.arc(circleX, switchHeight / 2, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    drawSwitch();

    canvas.addEventListener('click', function() {
        isOn = !isOn;
        drawSwitch();
        toggleButtons(isOn);
        if (isOn) {
            updateTemperatureDisplay(); 
        } else {
            stopHeating(); 
        }
    });

    function toggleButtons(enabled) {
        const buttons = document.querySelectorAll('.setting-button');
        buttons.forEach(button => {
            button.disabled = !enabled; 
            button.classList.remove('active');
            backgroundImage.classList.remove('low-flame', 'medium-flame', 'warm-flame', 'high-flame');
            fireSound.pause();
            fireSound.currentTime = 0;
        });
    }

    const buttons = document.querySelectorAll('.setting-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            if (isOn) {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const setting = button.getAttribute('data-setting');
                let newTemperature;

                switch (setting) {
                    case 'low':
                        backgroundImage.classList.add('low-flame');
                        fireSound.playbackRate = 0.7; 
                        fireSound.volume = 0.3; 
                        newTemperature = 50;
                        break;
                    case 'medium':
                        backgroundImage.classList.add('medium-flame');
                        fireSound.playbackRate = 1; 
                        fireSound.volume = 0.5; 
                        newTemperature = 70; 
                        break;
                    case 'warm':
                        backgroundImage.classList.add('warm-flame');
                        fireSound.playbackRate = 1.2; 
                        fireSound.volume = 0.7; 
                        newTemperature = 90;
                        break;
                    case 'high':
                        backgroundImage.classList.add('high-flame');
                        fireSound.playbackRate = 1.5; 
                        fireSound.volume = 1; 
                        newTemperature = 110;
                        break;   
                }

                temperature = newTemperature;
                const memberships = fuzzifyTemperature(temperature);
                const output = applyFuzzyRules(memberships);
                idealTemperature = defuzzify(output); 

                updateTemperatureDisplay();
                fireSound.play();
                startHeating(); 
            }
            event.stopPropagation();
        });
    });

    function startHeating() {
        updateTemperatureDisplay();
    }

    function stopHeating() {
        temperature = 0; 
        updateTemperatureDisplay(); 
    }

    function updateTemperatureDisplay() {
        document.getElementById('temperature-display').textContent = `Temperature: ${temperature}°F`;
    }

    function fuzzifyTemperature(currentTemperature) {
        const cold = Math.max(0, Math.min(1, (70 - currentTemperature) / 20)); 
        const warm = Math.max(0, Math.min(1, (currentTemperature - 50) / 20)); 
        const hot = Math.max(0, Math.min(1, (currentTemperature - 90) / 20)); 

        return {
            cold: cold,
            warm: warm,
            hot: hot
        };
    }

    function applyFuzzyRules(memberships) {
        let output = {
            low: 0,
            medium: 0,
            high: 0,
            off: 0
        };

        if (memberships.cold > 0) {
            output.low = memberships.cold;  
        }
        if (memberships.warm > 0) {
            output.medium = memberships.warm;  
        }
        if (memberships.hot > 0) {
            output.off = memberships.hot;  
        }

        return output;
    }

    function defuzzify(output) {
        let temperatureSetting = 0;

        const totalWeight = output.low + output.medium + output.high + output.off;
        
        if (totalWeight > 0) {
            temperatureSetting = (
                (output.low * 50) + 
                (output.medium * 70) + 
                (output.high * 110) + 
                (output.off * 0)
            ) / totalWeight; 
        }

        return temperatureSetting;
    }
};
