/** 
 * @file pxt-CodeRover-Test/main.ts
 * @brief EdifyRobitics' CodeRover makecode library.
 * @n [You may purchase CodeRover kit here]()
 * @n Programmable robot platforms for Micro:Bit.
 * 
 * @copyright    [EdifyRobotics](http://www.edifyrobotics.com), 2021
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](tony_ying@edifyrobotics.com)
 * @date  Nov/24/2021
*/

	enum MotorChoice {
	    //% block="left"
	    Left,
	    //% block="right"
	    Right,
	}

	enum CodeRoverTurnDirection{
		//% block="left"
	    Left,
	    //% block="right"
	    Right,
	}

	enum CodeRoverDriveDirection{
		//% block="forward"
	    Forward,
	    //% block="backward"
	    Backward,
	}

	enum MotorShaftDirection {
	    //% block="clockwise"
	    Clockwise,
	    //% block="counter-clockwise"
	    CounterClockwise
	}



//% color="#FEC700"
//% groups="['Motor Controls','Sensor Controls']"
namespace CodeRorver {

    /**
     * Set the motor speed and direction
     * @param direction to perform the spin, eg: left
     * @param degree need to turn, eg: 45
     */
    //% block="Turn %degree degrees to the %turnChoice"
    //% degree.min=0 degree.max=360
   	//% group="Motor Controls"
    export function CodeRoverTurn(degree : number, turnChoice: CodeRoverTurnDirection) {

    }


    /**
     * Set the motor speed and direction
     * @param direction to drive, eg: forward
     * @param drive speed percentage, eg: 50
     * @param drive duration, eg: 500
     */
    //% block="Drive %direction at %speed for %duration ms"
    //% speed.min=0 speed.max=100
    //% duration.shadow=timePicker
   	//% group="Motor Controls"
    export function CodeRoverDrive(direction : CodeRoverDriveDirection, speed:number, duration: number) {
    	led.enable(false);

    	if(direction==CodeRoverDriveDirection.Forward){
    		//right side clockwise 
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P6, 1);
			//left side counter-clockwise
			pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 0);

			//then stop 
			basic.pause(duration);
			pins.analogWritePin(AnalogPin.P0, 1023);
			pins.digitalWritePin(DigitalPin.P6, 1);
			pins.analogWritePin(AnalogPin.P1, 1023);
			pins.digitalWritePin(DigitalPin.P7, 1);
			basic.pause(1);
    		
    	}
    	else if(direction==CodeRoverDriveDirection.Backward){
    		//right side counter-clockwise
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P6, 0);
			//left side clockwise
			pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 1);


    		//then stop 
			basic.pause(duration);
			pins.analogWritePin(AnalogPin.P0, 1023);
			pins.digitalWritePin(DigitalPin.P6, 1);
			pins.analogWritePin(AnalogPin.P1, 1023);
			pins.digitalWritePin(DigitalPin.P7, 1);
			basic.pause(1);
    	}
    }


    /**
     * Set the left motor speed and direction
     * @param directon to turn the left motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in percentage, eg: 30%
     * @param duration in milliseconds to run the
     *      motor the alarm sound, eg: 2000
     */
    //% block="Left motor run|| %direction|at %speed |for %duration ms"
    //% group="Motor Controls"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    //% expandableArgumentMode="enabled"
    export function setLeftMotorSpeed(direction: MotorShaftDirection,speed: number,duration: number) {
    	led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 1);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P1, 1023);
			pins.digitalWritePin(DigitalPin.P7, 1);
    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 0);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P1, 1023);
			pins.digitalWritePin(DigitalPin.P7, 1);
    	}
    }




    /**
     * Set the right motor speed and direction
     * @param directon to turn the right motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in percentage, eg: 30
     * @param duration in milliseconds to run the
     *      motor the alarm sound, eg: 2000
     */
    //% block="Right motor run|| %direction|at %speed |for %duration ms"
    //% group="Motor Controls"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    //% expandableArgumentMode="enabled"
    export function setRightMotorSpeed(direction: MotorShaftDirection,speed: number,duration: number) {
    	led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P6, 1);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P0, 1023);
			pins.digitalWritePin(DigitalPin.P6, 1);
    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P6, 0);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P0, 1023);
			pins.digitalWritePin(DigitalPin.P6, 1);
    	}
    }



}	