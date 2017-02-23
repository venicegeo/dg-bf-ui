

import java.util.Scanner;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;

public class JUnitRunner {

	public static void main(String[] args) {
		System.out.println("Test Suite Loaded Please Select Test To Run");
		System.out.println("-1- Coordinate Inputs");
		System.out.println("-2- Login");
		System.out.println("-3- End to End");
		System.out.println("-4- Main Screen UI");
		System.out.println("-5- Quit");
		
		Scanner sc = new Scanner(System.in);
		int i = sc.nextInt();
		JUnitCore junit = new JUnitCore();
		while (i!=5){
		switch(i){
			case 1: junit.run(coordInput.AppTest.class);
			break;
			case 2: junit.run(Login.AppTest.class);
			break;
			case 3: junit.run(EndToEnd.AppTest.class);
			break;
			case 4: junit.run(MainScreen.AppTest.class);
			default: System.out.println("Entered Value Does Not Corrisponed To A Test");
			break;
		}
		}
		
		

	}

}
