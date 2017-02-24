

import java.util.Scanner;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;

public class MainScreenTestRunner {

	public static void main(String[] args) {
		JUnitCore junit = new JUnitCore();

		junit.run(MainScreen.AppTest.class);

		}
	}


