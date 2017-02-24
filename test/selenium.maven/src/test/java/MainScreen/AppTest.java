/*******************************************************************************
* Copyright 2016, RadiantBlue Technologies, Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*******************************************************************************/

/**
*
*    @author           BenPeizerIM
*    PROJECT:          Beachfront project
*    CLASS:            Test Runner
*              ** REVISION HISTORY : **
*    Created:   10/22/2016
*    Updates:
*
*/

package MainScreen;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;

import lux.MultiThreadedRunner;

@RunWith(MultiThreadedRunner.class)
public class AppTest {
      @Test
      @Category(MainScreenTest.class)
      public void testForTest1() {
    	  MainScreenTest test1 = new MainScreenTest();
       try {
    	   System.out.println("PzTestPass11 main screen test started");
    	   test1.setUp();
    	   test1.testBeachfrontMain();
    	   System.out.println("Main screen successful");
    	   System.out.println("PzTestPass11 main screen test ended");
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		System.out.println("Login fail stack trace:");
		e.printStackTrace();
	}
      }
    }