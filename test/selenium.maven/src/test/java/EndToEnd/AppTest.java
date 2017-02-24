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

package EndToEnd;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;

import lux.MultiThreadedRunner;

@RunWith(MultiThreadedRunner.class)
public class AppTest {
      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest1() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   String message="";
    	   System.out.println("PzTestPass11 end to end test started");
    	   test1.setUp(0);
    	   test1.testStep1BFLogin(0);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(0);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass11 end to end test ended");
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }/*
      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest2() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass12 end to end test started");
    	   test1.setUp(1);
    	   test1.testStep1BFLogin(1);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(1);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass12 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }

      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest3() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass13 end to end test started");
    	   test1.setUp(2);
    	   test1.testStep1BFLogin(2);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(2);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass13 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }

      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest4() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass14 end to end test started");
    	   test1.setUp(3);
    	   test1.testStep1BFLogin(3);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(3);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass14 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }
      
      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest5() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass15 end to end test started");
    	   test1.setUp(4);
    	   test1.testStep1BFLogin(4);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(4);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass15 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }
     @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest6() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass16 end to end test started");
    	   test1.setUp(5);
    	   test1.testStep1BFLogin(5);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(5);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass16 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }
      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest7() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass17 end to end test started");
    	   test1.setUp(6);
    	   test1.testStep1BFLogin(6);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(6);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass17 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }

      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest8() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass18 end to end test started");
    	   test1.setUp(7);
    	   test1.testStep1BFLogin(7);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(7);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass18 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }
      @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest9() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass19 end to end test started");
    	   test1.setUp(8);
    	   test1.testStep1BFLogin(8);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(8);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass19 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }
             @Test
      @Category(BFUIJobsExcnVldtnTest.class)
      public void testForTest10() {
    	  BFUIJobsExcnVldtnTest test1 = new BFUIJobsExcnVldtnTest();
       try {
    	   System.out.println("PzTestPass20 end to end test started");
    	   test1.setUp(9);
    	   test1.testStep1BFLogin(9);
    	   test1.testStep2BFUIImagerySubmit();
    	   test1.testStep3BFSIResponsePopup(9);
    	   test1.testStep4BFSIRespPropsVldtn();
    	   test1.testStep5RespImageLink();
    	   test1.testStep6BFRunAlgoVldtn();
    	   test1.testStep7JobsExcnVldtn();
    	   System.out.println("PzTestPass20 end to end test ended");

	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
       try {
		test1.tearDown();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
      }*/
      
      }