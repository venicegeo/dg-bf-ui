

import java.util.Scanner;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;

public class EndToEndTestRunner {

	public static void main(String[] args) {
		JUnitCore junit = new JUnitCore();

		junit.run(EndToEnd.AppTest.class);

		}
	}


