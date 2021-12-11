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

//pin setup 
//motor 1 P0,P14 
//motor 2 p1,p15
//RGB P11 P6 P7 
//hall 1 p5 
//hall 2 p11
//sda p20 
//scl p19
//tx p13 rx p 12 
//servo p10 
//eco p8 trig p4


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


	enum IRValue{
	   //% block="●" enumval=0
        TrackingOn,
        //% block="◌" enumval=1
        TrackingOff,
	}

	enum bothIRValue{
		//% block="● ●" enumval=0
        Tracking_State_0,
        //% block="● ◌" enumval=1
        Tracking_State_1,
        //% block="◌ ●" enumval=2
        Tracking_State_2,
        //% block="◌ ◌" enumval=3
        Tracking_State_3
	}

	/**
	  * Pre-Defined LED colours
	  */
	// enum BBColors
	// {
	//     //% block=red
	//     Red = 0xff0000,
	//     //% block=orange
	//     Orange = 0xffa500,
	//     //% block=yellow
	//     Yellow = 0xffff00,
	//     //% block=green
	//     Green = 0x00ff00,
	//     //% block=blue
	//     Blue = 0x0000ff,
	//     //% block=indigo
	//     Indigo = 0x4b0082,
	//     //% block=violet
	//     Violet = 0x8a2be2,
	//     //% block=purple
	//     Purple = 0xff00ff,
	//     //% block=white
	//     White = 0xffffff,
	//     //% block=black
	//     Black = 0x000000
	// }

	enum RGBColors
	{
	    //% block=red
	    Red = 0xff0000,
	    //% block=green
	    Green = 0x00ff00,
	    //% block=blue
	    Blue = 0x0000ff,
	    //% block=yellow
	    Yellow = 0xffff00,
	    //% block=violet
	    Violet = 0xff00ff,
	   	//% block=turquoise
	    turquoise = 0x00fff,
	    //% block=white
	    White = 0xffffff,
	}







//% color="#FEC700"
//% groups="['Motor Speed', 'Motor Duration', 'Direction', 'Sensor Controls', 'Servo Controls', 'RGB controls', 'RGB']"
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
	let canDriveRobotNoStop=false 
	let startDriveTime=0 //this keeps track of duration
	let lastEndTime = 0 //this keeps track of how often driveRobot function will compare 2 hall sensor counts. 
	let sonarLastEndTime=0//checks sonar value every 10ms 

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
	        pins.digitalWritePin(DigitalPin.P14, 0)
	        pins.analogWritePin(AnalogPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P15, 0)

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
			            pins.digitalWritePin(DigitalPin.P14, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 0)
			            // pins.digitalWritePin(DigitalPin.P9, 1)
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
			            pins.digitalWritePin(DigitalPin.P14, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 1)
			            // pins.digitalWritePin(DigitalPin.P9, 1)
			        } else {
			            // p0p6 is the same as p1p7
			            pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 0)
			            // pins.digitalWritePin(DigitalPin.P9, 0)
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
			            pins.digitalWritePin(DigitalPin.P15, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 0)
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
			            pins.digitalWritePin(DigitalPin.P15, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 1)
			            // pins.digitalWritePin(DigitalPin.P9, 1)
			        } else {
			            // p0p6 is the same as p1p7
			            pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 0)
			            // pins.digitalWritePin(DigitalPin.P9, 0)
			        }
		       	}
		        
		        lastEndTime = input.runningTime()
		    }
	    }

	    
	}

    //counter function to keep motor going on a straight line 



    //drive robot nonestop 
    function driveRobotNoStop (direction:number, targetSpeed:number, pValue:number) {

    		//drive robot nonestop function nest within ultrasound sensor check value function 
    		//ultrasound checks every 30ms, drive function works best if its called every 10ms. 
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
			            pins.digitalWritePin(DigitalPin.P14, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 0)
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
			            pins.digitalWritePin(DigitalPin.P14, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 0)
			            pins.digitalWritePin(DigitalPin.P3, 1)
			            pins.digitalWritePin(DigitalPin.P9, 1)
			        } else {
			            // p0p6 is the same as p1p7
			            pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P1, Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 0)
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
			            pins.digitalWritePin(DigitalPin.P15, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * fasterSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 0)
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
			            pins.digitalWritePin(DigitalPin.P15, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * slowerSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 1)
			            // pins.digitalWritePin(DigitalPin.P9, 1)
			        } else {
			            // p0p6 is the same as p1p7
			            pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P15, 1)
			            // left side counter-clockwise
			            pins.analogWritePin(AnalogPin.P0, Math.round(1023 * initialSpeed / 100))
			            pins.digitalWritePin(DigitalPin.P14, 0)
			            // pins.digitalWritePin(DigitalPin.P3, 0)
			            // pins.digitalWritePin(DigitalPin.P9, 0)
			        }
		       	}
		        
		        lastEndTime = input.runningTime()
		    }
	    
	}
    //counter function to keep motor going on a straight line 



    //drive robot nonestop





    //turning 
    let turnSpeed=30
   	let keepTurning=false
   	function turnRobot(turnChoice:CodeRoverTurnDirection, degree:number){
   		if (input.runningTime() - lastEndTime >= 50) {
   			// counting hall sensor 60 times each side adds up to 90 degrees. 
   			//480 is 360 degrees. use 480/
	        if (hall1Count + hall2Count < 960*(degree/360)) {
	            if (turnChoice == CodeRoverTurnDirection.Right) {
	                if (hall1Count < hall2Count) {
	                    fasterSpeed = turnSpeed + pValue * (hall2Count - hall1Count)
	                    slowerSpeed = turnSpeed - pValue * (hall2Count - hall1Count)
	                    if (fasterSpeed > 70) {
	                        fasterSpeed = 70
	                    }
	                    if (slowerSpeed < 0) {
	                        slowerSpeed = 10
	                    }
	                    // p0p6 is faster than p1p7, p0p6 slow down
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, Math.round(1023 * slowerSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P14, 0)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, Math.round(1023 * fasterSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P15, 0)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else if (hall1Count > hall2Count) {
	                    // right side slower
	                    fasterSpeed = turnSpeed + pValue * (hall1Count - hall2Count)
	                    slowerSpeed = turnSpeed - pValue * (hall1Count - hall2Count)
	                    if (fasterSpeed > 70) {
	                        fasterSpeed = 70
	                    }
	                    if (slowerSpeed < 0) {
	                        slowerSpeed = 10
	                    }
	                    // p0p6 is slower than p1p7, p0p6 speed up
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, Math.round(1023 * fasterSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P14, 0)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, Math.round(1023 * slowerSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P15, 0)
	                    pins.digitalWritePin(DigitalPin.P3, 1)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else {
	                    // p0p6 is the same as p1p7
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, Math.round(1023 * turnSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P14, 0)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, Math.round(1023 * turnSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P15, 0)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 0)
	                }
	            } else if (turnChoice == CodeRoverTurnDirection.Left) {
	                if (hall1Count < hall2Count) {
	                    fasterSpeed = turnSpeed + pValue * (hall2Count - hall1Count)
	                    slowerSpeed = turnSpeed - pValue * (hall2Count - hall1Count)
	                    if (fasterSpeed > 70) {
	                        fasterSpeed = 70
	                    }
	                    if (slowerSpeed < 0) {
	                        slowerSpeed = 10
	                    }
	                    // p0p6 is faster than p1p7, p0p6 slow down
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * slowerSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P14, 1)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * fasterSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P15, 1)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else if (hall1Count > hall2Count) {
	                    // right side slower
	                    fasterSpeed = turnSpeed + pValue * (hall1Count - hall2Count)
	                    slowerSpeed = turnSpeed - pValue * (hall1Count - hall2Count)
	                    if (fasterSpeed > 70) {
	                        fasterSpeed = 70
	                    }
	                    if (slowerSpeed < 0) {
	                        slowerSpeed = 10
	                    }
	                    // p0p6 is slower than p1p7, p0p6 speed up
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * fasterSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P14, 1)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * slowerSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P15, 1)
	                    pins.digitalWritePin(DigitalPin.P3, 1)
	                    pins.digitalWritePin(DigitalPin.P9, 1)
	                } else {
	                    // p0p6 is the same as p1p7
	                    // right side clockwise
	                    pins.analogWritePin(AnalogPin.P0, 1023 - Math.round(1023 * turnSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P14, 1)
	                    // left side counter-clockwise
	                    pins.analogWritePin(AnalogPin.P1, 1023 - Math.round(1023 * turnSpeed / 100))
	                    pins.digitalWritePin(DigitalPin.P15, 1)
	                    pins.digitalWritePin(DigitalPin.P3, 0)
	                    pins.digitalWritePin(DigitalPin.P9, 0)
	                }
	            }
	        } else {
	            // p0p6 is faster than p1p7, p0p6 slow down
	            // right side clockwise
	            pins.analogWritePin(AnalogPin.P0, 0)
	            pins.digitalWritePin(DigitalPin.P14, 0)
	            // left side counter-clockwise
	            pins.analogWritePin(AnalogPin.P1, 0)
	            pins.digitalWritePin(DigitalPin.P15, 0)

	            //stop turning 
	            keepTurning=false 
	        }
	        lastEndTime = input.runningTime()
	    }
   	}





   	function callTurningFunction(degree : number, turnChoice: CodeRoverTurnDirection, turnSignal:boolean){
   		//set keepTurning to true after duration set it to false 
   		keepTurning=turnSignal

		while(keepTurning==true){
			countHall()
			turnRobot(turnChoice,degree)
		}	
   	}

    /**
     * Set the motor speed and direction
     * @param direction to perform the spin, eg: left
     * @param degree need to turn, eg: 45
     */
    //% block="Turn %degree degrees to the %turnChoice"
    //% degree.min=0 degree.max=360
   	//% group="Direction"
    export function CodeRoverTurn(degree : number, turnChoice: CodeRoverTurnDirection) {
    	//need to check for hall sensor 
    	//to make sure its turning the correct degree 
    	// 让电机不转p6,p7是与led共用
		led.enable(false)
		// 霍尔需要先设定p5,p11的pull，防止两个pin是随机电压？
		pins.setPull(DigitalPin.P5, PinPullMode.PullDown)
		pins.setPull(DigitalPin.P11, PinPullMode.PullDown)
		pValue=turnSpeed/(turnSpeed*0.3)

		callTurningFunction(degree,turnChoice,true)
    }





   	function callDriveFunction(direction : CodeRoverDriveDirection, speed:number, duration: number, pValue:number, driveSignal:boolean){
   		
   		canDriveRobot=driveSignal
		while(canDriveRobot==true){
			countHall()
			driveRobot(direction,speed,duration,pValue)
		}	
   	}


    /**
     * Set the motor speed, direction, pValue and duration.
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

		callDriveFunction(direction,speed,duration,pValue,true)
    }





   	/**
     * Set the motor speed, Pvalue and direction
     * @param direction to drive, eg: forward
     * @param drive speed percentage, eg: 50
     * @param drive duration, eg: 500
     */
    //% block="Drive %direction at %speed"
    //% speed.min=0 speed.max=100
    //% duration.shadow=timePicker
   	//% group="Direction"
    export function CodeRoverDriveNoStop(direction : CodeRoverDriveDirection, speed:number) {
    	//need too check for hall sensor 
    	//to make sure its going straight 
    	// 让电机不转p6,p7是与led共用
		led.enable(false)
		// 霍尔需要先设定p5,p11的pull，防止两个pin是随机电压？
		pValue=speed/(speed*0.3)

		canDriveRobotNoStop=true

		// while(canDriveRobotNoStop==true){
		if (canDriveRobotNoStop==true){
			countHall()
			driveRobotNoStop(direction,speed,pValue)
		}
    }



    /**
     * stop codeRover movement 
     */
    //% block="Stop CodeRover"
   	//% group="Direction"
    export function CodeRoverStop() {
    	//need too check for hall sensor 
    	//to make sure its going straight 
    	// 让电机不转p6,p7是与led共用
		led.enable(false)


		// canDriveRobotNoStop = false
		canDriveRobotNoStop=false
		hall1Count=0
		hall2Count=0


		// basic.pause(10)
    	pins.analogWritePin(AnalogPin.P0, 0)
	    pins.digitalWritePin(DigitalPin.P14, 0)
	    pins.analogWritePin(AnalogPin.P1, 0)
	    pins.digitalWritePin(DigitalPin.P15, 0)

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
    	// led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P1, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P15, 1);

    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P1, Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P15, 0);

    	}
    }


    // /**
    //  * Stop both motors
    //  */
    // //% block="Stop both motors"
    // //% group="Motor Speed"
    // export function stopMotors() {
    // 	led.enable(false);


    // 	pins.analogWritePin(AnalogPin.P0, 0)
	   //  pins.digitalWritePin(DigitalPin.P14, 0)
	   //  pins.analogWritePin(AnalogPin.P1, 0)
	   //  pins.digitalWritePin(DigitalPin.P15, 0)
    	
    // }




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
    	// led.enable(false);

    	if(direction==MotorShaftDirection.Clockwise){
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P14, 1);

    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P0, Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P14, 0);

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
			pins.digitalWritePin(DigitalPin.P15, 1);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P1, 0);
			pins.digitalWritePin(DigitalPin.P15, 0);
    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P1, Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P15, 0);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P1, 0);
			pins.digitalWritePin(DigitalPin.P15, 0);
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
			pins.digitalWritePin(DigitalPin.P14, 1);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P0, 1023);
			pins.digitalWritePin(DigitalPin.P14, 1);
    	}
    	else if(direction==MotorShaftDirection.CounterClockwise){
    		pins.analogWritePin(AnalogPin.P0, 1023-Math.round(1023*speed/100));
			pins.digitalWritePin(DigitalPin.P14, 0);

			basic.pause(duration);

			pins.analogWritePin(AnalogPin.P0, 1023);
			pins.digitalWritePin(DigitalPin.P14, 1);
    	}
    }





    //ultrasound sensor block is based on small modification and adpotaion of https://github.com/microsoft/pxt-sonar by pelikhan 
	/**
	* Send a ping and get the echo time (in microseconds) as a result. there is a 10ms pause between each call
	* @param unit desired conversion unit, eg:Centimeters
	* @param maxCmDistance maximum distance in centimeters (default is 500)
	*/
	//% blockId=sonar_ping block="Ultrasound value: Trig P4 Echo P8| unit %unit"
	//% color="#6fa8dc" 
	//% group="Sensor Controls"


	//potential bug: turns to the right after a while 
	export function getUltrasoundSensorValue(unit: PingUnit, maxCmDistance = 500): number {
		if (input.runningTime() - sonarLastEndTime >= 30) { // pause 30ms before next call



			// send pulse
			pins.setPull(DigitalPin.P4, PinPullMode.PullNone);
			pins.digitalWritePin(DigitalPin.P4, 0);
			control.waitMicros(2);
			pins.digitalWritePin(DigitalPin.P4, 1);
			control.waitMicros(10);
			pins.digitalWritePin(DigitalPin.P4, 0);

			// read pulse
			const d = pins.pulseIn(DigitalPin.P8, PulseValue.High, maxCmDistance * 58);
			

			// switch (unit) {
			// 	case PingUnit.Centimeters: return Math.idiv(d, 58);
			// 	case PingUnit.Inches: return Math.idiv(d, 148);
			// 	default: return d ;
			// }


			sonarLastEndTime = input.runningTime()

			if(unit==PingUnit.Centimeters){
				return Math.idiv(d, 58);
			}
			else if(unit == PingUnit.Inches){
				return Math.idiv(d, 148);
			}
			else{
				return d;

			}

		}
		else{
			return -1000
		}
	}



	
	//ultrasound sensor block is based on small modification and adpotaion of https://github.com/microsoft/pxt-sonar by pelikhan 



	//IR aka line tracing sensor util right sensor conenct to P3 control motorp0p6 Left sensor connect to P2 control motor p1p7
	/**
	* read left and right IR sensor value turns 1 on white surface returns 0 on black surface.
	* @param choose to read value from left or right IR sensor
	*/
	//% block="%IRChoice IR sensor value"
	//% color="#6fa8dc"
	//% group="Sensor Controls"
	export function getIRSensorValue(IRChoice: IRPins ): number {

		
		switch(IRChoice){
			case IRPins.left: return pins.digitalReadPin(DigitalPin.P2);
			case IRPins.right: return pins.digitalReadPin(DigitalPin.P3);
		}
			

	 }



	//IR aka line tracing sensor util right sensor conenct to P3 control motorp0p6 Left sensor connect to P2 control motor p1p7
	/**
	* read left and right IR sensor value returns true or false based on selection.
	* @param choose to read value from left or right IR sensor
	* @param choose the IR state, while or black
	*/
	//% block="%IRChoice IR sensor value is %IRValueChoice"
	//% color="#6fa8dc"
	//% group="Sensor Controls"
	export function checkIRSensor(IRChoice: IRPins, IRValueChoice:IRValue): boolean {

		if(IRChoice==IRPins.left){
			if(pins.digitalReadPin(DigitalPin.P2)==1 && IRValueChoice==IRValue.TrackingOn){
				return true
			}
			else if(pins.digitalReadPin(DigitalPin.P2)==0 && IRValueChoice==IRValue.TrackingOff){
				return true
			}
			else{
				return false 
			}
		}
		else if(IRChoice==IRPins.right){
			if(pins.digitalReadPin(DigitalPin.P3)==1 && IRValueChoice==IRValue.TrackingOn){
				return true
			}
			else if(pins.digitalReadPin(DigitalPin.P3)==0 && IRValueChoice==IRValue.TrackingOff){
				return true
			}
			else{
				return false 
			}
		}
		else{
			return false
		}

	}


	/**
      * Sets all LEDs to a given color (range 0-255 for r, g, b).
      * @param rgb RGB color of the LED
      */
    //% blockId="setRGB" block="set RGB color to%rgb=RGBColor"
    //% weight=100
    //% group="RGB"
    //% blockGap=8
    export function setRGBColor(rgb: number)
    {
    	led.enable(false);

        // fire().setBand(rgb);
        // updateLEDs();
        //red 
        if(rgb==16711680){
        	pins.digitalWritePin(DigitalPin.P9, 1); //b
        	pins.digitalWritePin(DigitalPin.P6, 1); //g
        	pins.digitalWritePin(DigitalPin.P7, 0); //r

        }
        //blue 
        else if(rgb==65280){
        	pins.digitalWritePin(DigitalPin.P9, 0);
        	pins.digitalWritePin(DigitalPin.P6, 1);
        	pins.digitalWritePin(DigitalPin.P7, 1);
        } 
        //green 
        else if(rgb==255){
        	pins.digitalWritePin(DigitalPin.P9, 1);
        	pins.digitalWritePin(DigitalPin.P6, 0);
        	pins.digitalWritePin(DigitalPin.P7, 1);
        }
        //yellow 
        else if(rgb==16776960){
        	pins.digitalWritePin(DigitalPin.P9, 0);
        	pins.digitalWritePin(DigitalPin.P6, 1);
        	pins.digitalWritePin(DigitalPin.P7, 0);
        }
        //purple 
        else if(rgb==16711935){
        	pins.digitalWritePin(DigitalPin.P9, 1);
        	pins.digitalWritePin(DigitalPin.P6, 0);
        	pins.digitalWritePin(DigitalPin.P7, 0);
        }
        //turquoise
        else if(rgb==65535){
        	pins.digitalWritePin(DigitalPin.P9, 0);
        	pins.digitalWritePin(DigitalPin.P6, 0);
        	pins.digitalWritePin(DigitalPin.P7, 1);
        }
        //white 
        else if(rgb==16777215){
        	pins.digitalWritePin(DigitalPin.P9, 0);
        	pins.digitalWritePin(DigitalPin.P6, 0);
        	pins.digitalWritePin(DigitalPin.P7, 0);
        }

    }

   /**
      * Get numeric value of colour
      * @param color Standard RGB Led Colours eg: #ff0000
      */
    //% blockId="RGBColor" block=%color
    //% blockHidden=false
    //% weight=70
    //% group="RGB"
    //% blockGap=8
    //% shim=TD_ID colorSecondary="#e7660b"
    //% color.fieldEditor="colornumber"
    //% color.fieldOptions.decompileLiterals=true
    //% color.defl='#ff0000'
    //% color.fieldOptions.colours='["#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#ffffff"]'
    //% color.fieldOptions.columns=7
    //% color.fieldOptions.className='rgbColorPicker'


    export function getColorValue(color: number): number
    {
    	// let hexStr = color.toString(16); tostring does not work on makecode, yet?

        return color;
    }


}	