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

	enum PingUnit {
	    
	    //% block="cm"
	    Centimeters,
	    //% block="inches"
	    Inches,
	    //% block="μs"
	    MicroSeconds
	}

	enum IRPins {
	    
	    //% block="left"
	    left,

	    //% block="right"
	    right
	}




//% color="#FEC700"
//% groups="['Motor Speed', 'Motor Duration', 'Direction', 'Sensor Controls', 'Servo Controls', 'RGB controls']"
namespace CodeRorver {

	//attention!!! when p6 and p7 is set to 1, pwm is inverse, meaning 1023 is stop.
	//when p6 and p7 is set to 0, pwm is not inverse, meaning 0 is stop.


    //counter function to keep motor going on a straight line 

    let slowerSpeed = 0
	let fasterSpeed = 0
	let hall2Count = 0
	let hall1Count = 0
	let hall2Triggered = false
	let hall1Triggered = false
	let initialSpeed = 0 
	let pValue=0
	let canDriveRobot=false 
	let startDriveTime=0 //this keeps track of duration
	let lastEndTime = 0 //this keeps track of how often driveRobot function will compare 2 hall sensor counts. 

	initialSpeed = 0 //initial speed will increase to user inputed target speed. 

	let checkedDirection=0


    function countHall () {
	    if (pins.digitalReadPin(DigitalPin.P5) == 1 && hall1Triggered == false) {
	        hall1Triggered = true
	    } else if (pins.digitalReadPin(DigitalPin.P5) == 0 && hall1Triggered == true) {
	        hall1Count += 1
	        hall1Triggered = false
	    }
	    if (pins.digitalReadPin(DigitalPin.P11) == 1 && hall2Triggered == false) {
	        hall2Triggered = true
	    } else if (pins.digitalReadPin(DigitalPin.P11) == 0 && hall2Triggered == true) {
	        hall2Count += 1
	        hall2Triggered = false
	    }
	}

	function driveRobot (direction:number, targetSpeed:number, duration:number, pValue:number) {

		if (startDriveTime==0){
			startDriveTime=input.runningTime()
		}
		//code to stop car after duration 
	    if (input.runningTime() - startDriveTime >= duration) {
	    	//stop and clear variable 
	        canDriveRobot = false

	        //stop the car
	        pins.analogWritePin(AnalogPin.P0, 0)
	        pins.digitalWritePin(DigitalPin.P6, 0)
	        pins.analogWritePin(AnalogPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P7, 0)

            basic.pause(10)
           	startDriveTime=0
	        lastEndTime=0
	        hall1Count=0
	        hall2Count=0
	        hall1Triggered=false 
	        hall2Triggered=false
	    }
	    else{
	    	if (input.runningTime() - lastEndTime >= 50) {
		        if (initialSpeed < targetSpeed) {
		            initialSpeed = initialSpeed + 1
		            if (initialSpeed > targetSpeed) {
		                initialSpeed = targetSpeed
		            }
		        }
		        //move forward straight 
		       	if (direction==CodeRoverDriveDirection.Forward){
		       		if (hall1Count < hall2Count) {
			            fasterSpeed = initialSpeed + pValue * (hall2Count - hall1Count)
			            slowerSpeed = initialSpeed - pValue * (hall2Count - hall1Count)
			            // fasterSpeed=20
			            // slowerSpeed=0
			            if (fasterSpeed > 70) { //limit max speed to 70% and min speed to 10%
			                fasterSpeed = 70
			            }
			            if (slowerSpeed < 0) {
			                slowerSpeed = 10
			            }
			            // p0p6 is faster than p1p7, p0p6 slow down
			            pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P6, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P7, 0)
			            pins.digitalWritePin(DigitalPin.P3, 0)
			            pins.digitalWritePin(DigitalPin.P9, 1)
			        } else if (hall1Count > hall2Count) {
			            // right side slower
			            fasterSpeed = initialSpeed + pValue * (hall1Count - hall2Count)
			            slowerSpeed = initialSpeed - pValue * (hall1Count - hall2Count)
			            // fasterSpeed=20
			            // slowerSpeed=0
			            if (fasterSpeed > 70) { //limit max speed to 70% and min speed to 10%
			                fasterSpeed = 70
			            }
			            if (slowerSpeed < 0) {
			                slowerSpeed = 10
			            }
			            // p0p6 is slower than p1p7, p0p6 speed up
			            pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P6, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P7, 0)
			            pins.digitalWritePin(DigitalPin.P3, 1)
			            pins.digitalWritePin(DigitalPin.P9, 1)
			        } else {
			            // p0p6 is the same as p1p7
			            pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P6, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P7, 0)
			            pins.digitalWritePin(DigitalPin.P3, 0)
			            pins.digitalWritePin(DigitalPin.P9, 0)
			        }
		       	}
		       	//move backward straight
		       	else if(direction==CodeRoverDriveDirection.Backward){
		       		if (hall1Count < hall2Count) {
			            fasterSpeed = initialSpeed + pValue * (hall2Count - hall1Count)
			            slowerSpeed = initialSpeed - pValue * (hall2Count - hall1Count)
			            if (fasterSpeed > 70) { //limit max speed to 70% and min speed to 10%
			                fasterSpeed = 70
			            }
			            if (slowerSpeed < 0) {
			                slowerSpeed = 10
			            }
			            // p0p6 is faster than p1p7, p0p6 slow down
			            pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P7, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P6, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 0)
			            // pins.digitalWritePin(DigitalPin.P9, 1)
			        } else if (hall1Count > hall2Count) {
			            // right side slower
			            fasterSpeed = initialSpeed + pValue * (hall1Count - hall2Count)
			            slowerSpeed = initialSpeed - pValue * (hall1Count - hall2Count)
			            if (fasterSpeed > 70) { //limit max speed to 70% and min speed to 10%
			                fasterSpeed = 70
			            }
			            if (slowerSpeed < 0) {
			                slowerSpeed = 10
			            }
			            // p0p6 is slower than p1p7, p0p6 speed up
			            pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P7, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P6, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 1)
			            // pins.digitalWritePin(DigitalPin.P9, 1)
			        } else {
			            // p0p6 is the same as p1p7
			            pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P7, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P6, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 0)
			            // pins.digitalWritePin(DigitalPin.P9, 0)
			        }
		       	}
		        
		        lastEndTime = input.runningTime()
		    }
	    }

	    
	}

    //counter function to keep motor going on a straight line 




    /**
     * Set the motor speed and direction
     * @param direction to perform the spin, eg: left
     * @param degree need to turn, eg: 45
     */
    //% block="Turn %degree degrees to the %turnChoice"
    //% degree.min=0 degree.max=360
   	//% group="Direction"

   	let turnSpeed=30
   	let keepTurning=false
   	function turnRobot(turnChoice:CodeRoverTurnDirection, degree:number){
   		if (input.runningTime() - lastEndTime >= 50) {
   			// counting hall sensor 60 times each side adds up to 90 degrees. 
   			//480 is 360 degrees. use 480/
	        if (hall1Count + hall2Count < 480*(degree/360)) {
	            if (turnChoice == CodeRoverTurnDirection.Right) {
	                if (hall1Count < hall2Count) {
	                    updateSpeed = initialSpeed + pValue * (hall2Count - hall1Count)
	                    updateSpeed2 = initialSpeed - pValue * (hall2Count - hall1Count)
	                    if (updateSpeed > 70) {
	                        updateSpeed = 70
	                    }
	                    if (updateSpeed2 < 0) {
	                        updateSpeed2 = 10
	                    }
	                    // p0p6 is faster than p1p7, p0p6 slow down
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, Math.round(1023 * updateSpeed2 / 100))
	                    pins.digitalWritePin(DigitalPin.P6, 0)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, Math.round(1023 * updateSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P7, 0)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else if (hall1Count > hall2Count) {
	                    // right side slower
	                    updateSpeed = initialSpeed + pValue * (hall1Count - hall2Count)
	                    updateSpeed2 = initialSpeed - pValue * (hall1Count - hall2Count)
	                    if (updateSpeed > 70) {
	                        updateSpeed = 70
	                    }
	                    if (updateSpeed2 < 0) {
	                        updateSpeed2 = 10
	                    }
	                    // p0p6 is slower than p1p7, p0p6 speed up
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, Math.round(1023 * updateSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P6, 0)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, Math.round(1023 * updateSpeed2 / 100))
	                    pins.digitalWritePin(DigitalPin.P7, 0)
	                    pins.digitalWritePin(DigitalPin.P3, 1)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else {
	                    // p0p6 is the same as p1p7
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, Math.round(1023 * initialSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P6, 0)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, Math.round(1023 * initialSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P7, 0)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 0)
	                }
	            } else if (turnChoice == CodeRoverTurnDirection.Left) {
	                if (hall1Count < hall2Count) {
	                    updateSpeed = initialSpeed + pValue * (hall2Count - hall1Count)
	                    updateSpeed2 = initialSpeed - pValue * (hall2Count - hall1Count)
	                    if (updateSpeed > 70) {
	                        updateSpeed = 70
	                    }
	                    if (updateSpeed2 < 0) {
	                        updateSpeed2 = 10
	                    }
	                    // p0p6 is faster than p1p7, p0p6 slow down
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * updateSpeed2 / 100))
	                    pins.digitalWritePin(DigitalPin.P6, 1)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * updateSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P7, 1)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else if (hall1Count > hall2Count) {
	                    // right side slower
	                    updateSpeed = initialSpeed + pValue * (hall1Count - hall2Count)
	                    updateSpeed2 = initialSpeed - pValue * (hall1Count - hall2Count)
	                    if (updateSpeed > 70) {
	                        updateSpeed = 70
	                    }
	                    if (updateSpeed2 < 0) {
	                        updateSpeed2 = 10
	                    }
	                    // p0p6 is slower than p1p7, p0p6 speed up
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * updateSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P6, 1)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * updateSpeed2 / 100))
	                    pins.digitalWritePin(DigitalPin.P7, 1)
	                    pins.digitalWritePin(DigitalPin.P3, 1)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else {
	                    // p0p6 is the same as p1p7
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * initialSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P6, 1)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * initialSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P7, 1)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 0)
	                }
	            }
	        } else {
	            // p0p6 is faster than p1p7, p0p6 slow down
	            // right side clockwise
	            pins.analogWritePin(AnalogPin.P0, 0)
	            pins.digitalWritePin(DigitalPin.P6, 0)
	            // left side counter-clockwise
	            pins.analogWritePin(AnalogPin.P1, 0)
	            pins.digitalWritePin(DigitalPin.P7, 0)

	            //stop turning 
	            keepTurning=false 
	        }
	        lastEndTime = input.runningTime()
	    }
   	}

    export function CodeRoverTurn(degree : number, turnChoice: CodeRoverTurnDirection) {
    	//need to check for hall sensor 
    	//to make sure its turning the correct degree 
    	// 让电机不转p6,p7是与led共用
		led.enable(false)
		// 霍尔需要先设定p5,p11的pull，防止两个pin是随机电压？
		pins.setPull(DigitalPin.P5, PinPullMode.PullDown)
		pins.setPull(DigitalPin.P11, PinPullMode.PullDown)
		pValue=turnSpeed/(turnSpeed*0.3)

		keepTurning=true
		//set canDriveRobot to true after duration set it to false 
		while(keepTurning==true){
			countHall()
			turnRobot(turnChoice,degree)
		}	
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
   	//% group="Direction"




    export function CodeRoverDrive(direction : CodeRoverDriveDirection, speed:number, duration: number) {
    	//need too check for hall sensor 
    	//to make sure its going straight 
    	// 让电机不转p6,p7是与led共用
		led.enable(false)
		// 霍尔需要先设定p5,p11的pull，防止两个pin是随机电压？
		pins.setPull(DigitalPin.P5, PinPullMode.PullDown)
		pins.setPull(DigitalPin.P11, PinPullMode.PullDown)
		pValue=speed/(speed*0.3)

		//set canDriveRobot to true after duration set it to false 
		canDriveRobot=true
		while(canDriveRobot==true){
			countHall()
			driveRobot(direction,speed,duration,pValue)
		}	
    }


    /**
     * Set the left motor speed and direction
     * @param directon to turn the left motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in percentage, eg: 30
     */
    //% block="Left motor run|%direction|at %speed"
    //% group="Motor Speed"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    export function setLeftMotorSpeed(direction: MotorShaftDirection,speed: number) {
    	led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 1);

    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P1, Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 0);

    	}
    }




    /**
     * Set the right motor speed and direction
     * @param directon to turn the right motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in percentage, eg: 30
     */
    //% block="Right motor run|%direction|at %speed"
    //% group="Motor Speed"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    export function setRightMotorSpeed(direction: MotorShaftDirection,speed: number) {
    	led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P6, 1);

    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P6, 0);

    	}
    }



    /**
     * Set the left motor speed, direction and duration
     * @param directon to turn the left motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in percentage, eg: 30
     * @param duration in milliseconds to run the
     *      motor the alarm sound, eg: 2000
     */
    //% block="Left motor run|| %direction|at %speed |for %duration ms"
    //% group="Motor Duration"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    //% expandableArgumentMode="enabled"
    export function setLeftMotorSpeedDuration(direction: MotorShaftDirection,speed: number,duration: number) {
    	led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 1);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P1, 0);
			pins.digitalWritePin(DigitalPin.P7, 0);
    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P1, Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P7, 0);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P1, 0);
			pins.digitalWritePin(DigitalPin.P7, 0);
    	}
    }




    /**
     * Set the right motor speed, direction and duration
     * @param directon to turn the right motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in percentage, eg: 30
     * @param duration in milliseconds to run the
     *      motor the alarm sound, eg: 2000
     */
    //% block="Right motor run|| %direction|at %speed |for %duration ms"
    //% group="Motor Duration"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    //% expandableArgumentMode="enabled"
    export function setRightMotorSpeedDuration(direction: MotorShaftDirection,speed: number,duration: number) {
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





    //ultrasound sensor block is based on small modification and adpotaion of https://github.com/microsoft/pxt-sonar by pelikhan 

	//Sonar and ping utilities
	//% color="#6fa8dc" 
	//% group="Sensor Controls"
	/**
	* Send a ping and get the echo time (in microseconds) as a result
	* @param unit desired conversion unit, eg:Centimeters
	* @param maxCmDistance maximum distance in centimeters (default is 500)
	*/
	//% blockId=sonar_ping block="Ultrasound value: Trig P4 Echo P8| unit %unit"
	export function getUltrasoundSensorValue(unit: PingUnit, maxCmDistance = 500): number {
		// send pulse
		pins.setPull(DigitalPin.P4, PinPullMode.PullNone);
		pins.digitalWritePin(DigitalPin.P4, 0);
		control.waitMicros(2);
		pins.digitalWritePin(DigitalPin.P4, 1);
		control.waitMicros(10);
		pins.digitalWritePin(DigitalPin.P4, 0);

		// read pulse
		const d = pins.pulseIn(DigitalPin.P8, PulseValue.High, maxCmDistance * 58);

		switch (unit) {
			case PingUnit.Centimeters: return Math.idiv(d, 58);
			case PingUnit.Inches: return Math.idiv(d, 148);
			default: return d ;
		}
	}
	
	//ultrasound sensor block is based on small modification and adpotaion of https://github.com/microsoft/pxt-sonar by pelikhan 



	//IR aka line tracing sensor util right sensor conenct to P3 control motorp0p6 Left sensor connect to P2 control motor p1p7
	//% color="#6fa8dc"
	//% group="Sensor Controls"
	/**
	* read left and right IR sensor value 
	* @param choose to read value from left or right IR sensor
	*/
	//% block="%IRPin IR sensor value"
	export function getIRSensorValue(IRChoice: IRPins ): number {
		switch(IRChoice){
			case IRPins.left: return pins.digitalReadPin(DigitalPin.P2);
			case IRPins.right: return pins.digitalReadPin(DigitalPin.P3);
		}

	 }




}	