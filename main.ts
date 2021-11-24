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
	    //% block="both"
	    Both,
	}

	enum MotorShaftDirection {
	    //% block="clockwise"
	    Clockwise,
	    //% block="counter-clockwise"
	    CounterClockwise
	}



//% color="#FEC700"
//% groups="['Examples' ,'Motor Controls']"
namespace CodeRorver {

	//% block="fooooooo"
	//% group="Examples"
    export function foo() {

    }

    //% block="bar x = $x text = $text"
    
    export function bar(x: number, text: string) {

    }

    //% block="shuffled text = $text x = $x"
    export function shuffled(x: number, text: string) {

    }



	//% group="Motor Controls"


	// Use inlineInputMode=inline to force inputs to appear
    // on a single line


    // Use expandableArgumentMode=enabeled to collapse or
    // expand EACH input parameter

    /**
     * Set the motor speed and direction
     * @param directon to turn the motor shaft in,
     *      eg: MotorShaftDirection.Clockwise
     * @param speed of the motor in RPM, eg: 30
     * @param duration in milliseconds to run the
     *      motor the alarm sound, eg: 2000
     */
    //% block="set the %motorChoice to run || %direction|at %speed |for %duration ms"
    //% duration.shadow=timePicker
    //% speed.min=0 speed.max=100
    //% expandableArgumentMode="enabled"
    export function setMotorSpeed(
    	motorChoice : MotorChoice,
        direction: MotorShaftDirection,
        speed: number,
        duration: number) {

    }



}	