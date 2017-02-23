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

package EndToEnd;

import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import java.util.*;  
import javax.mail.*;  
import javax.mail.internet.*;  
import javax.activation.*;  

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import static org.junit.Assert.fail;
import java.util.Properties;



/**
*
*    @author           BenPeizerIM
*    PROJECT:          Beachfront project
*    CLASS:            BFUIJobsExcnVldtn class to test the
*                      validation of the details and status of
*					   the requested Run Algorithm job executing
*					   and displayed under the Jobs panel.
*              ** REVISION HISTORY : **
*    Created:   10/22/2016
*    Updates:
*
*/
public class BFUIJobsExcnVldtnTest {
	  private WebDriver driver;
	  private String baseUrl;
	  private boolean acceptNextAlert = true;
	  private StringBuffer verificationErrors = new StringBuffer();
	  private String userName;
	  private String passwd;
	  private String apiKey;
	  private String imageID;
	  private boolean jobSuccess = false;
	  private boolean jobError = false;
	  private static final String thumbnail = "Thumbnail";
	  private static final String dateCaptured = "Date Captured";
	  private static final String bands = "Bands";
	  private static final String cloudCover = "Cloud Cover";
	  private static final String sensorName = "Sensor Name";
	  private static final String jobDetails = "Job Details";
	  private static final String jobName = "Name";
	  private static final String imageRqmts = "Image Requirements";
	  private static final String selectAlgo = "Select Algorithm";
	  private  SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
	  private  Calendar cal = Calendar.getInstance();
	  private String runAlgoJobInitiated;
	  private String runAlgoJobCompleted;
	  //List of cities to run jobs on the west coast of africa
	  private String[][] cordCity = new String[][]{
	  {"Bigonona","12.8,-16.2"}/*,
	  {"Kaolack","13.8,-15.8"},
	  {"Nauakchott","18.0,-15.9"},
	  {"Dakhda","23.4,-15.57"},
	  {"Boujdour","24.50,-14.00"},
	  {"Tan-Tan","28.25,-11.05"},
	  {"Agadir","30.24,-9.34"},
	  {"Lisbon","38.42,-9.08"},
	  {"Santa Cruz","26.55,-16.55"},
	  {"La Oliva","28.50,-14.30"}*/
	  };
	  //List of test user credentials
	  private String[][] userPass = new String[][]{
		  //{"PzTestPass11","P1azzauserpassword*"},
		  //{"PzTestPass12","P1azzauserpassword*"},
		  {"PzTestPass17","P1azzauserpassword*"}//,
		  //{"PzTestPass14","P1azzauserpassword*"},
		  //{"PzTestPass15","P1azzauserpassword*"},
		  //{"PzTestPass16","P1azzauserpassword*"},
		  //{"PzTestPass17","P1azzauserpassword*"},
		  //{"PzTestPass18","P1azzauserpassword*"},
		  //{"PzTestPass19","P1azzauserpassword*"},
		  //{"PzTestPass20","P1azzauserpassword*"}
	  };
	  //List of node paths
	  private String[] urls= new String[]{
		"http://0.0.0.0:4445/wd/hub"/*,
		"http://51.21.0.6:5567/wd/hub",
		"http://51.21.0.6:5568/wd/hub",
		"http://51.21.0.7:5566/wd/hub",
		"http://51.21.0.7:5567/wd/hub",
		"http://51.21.0.7:5568/wd/hub",
		"http://51.21.0.4:5566/wd/hub",
		"http://51.21.0.4:5567/wd/hub",
		"http://51.21.0.4:5568/wd/hub",
		"http://51.21.0.4:5569/wd/hub"*/
	  };

	/**
	 * @throws java.lang.Exception
	 */
	  @Before
	  public void setUp(int address) throws Exception {
		
		//System.setProperty("webdriver.gecko.driver", "/Users/Peizer/Downloads/geckodriver");
		baseUrl = "https://beachfront.stage.geointservices.io/";
		DesiredCapabilities capabilities = DesiredCapabilities.chrome();
		capabilities.setBrowserName("chrome");
		capabilities.setPlatform(Platform.WINDOWS);
		driver= new RemoteWebDriver(new URL(urls[address]), capabilities);
		driver.manage().timeouts().implicitlyWait(90, TimeUnit.MINUTES);
	}

	  /**
	   *  testStep1BFLogin() to actually test the BeachFront UI
	   *  login screen
	   *  
	   * @throws Exception
	   */
	  @Test
	  public void testStep1BFLogin(int user) throws Exception {
		String message ="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep1BFLogin() <<<< ");  
		driver.get(baseUrl);
	    
		
	    driver.findElement(By.linkText("Accept and Login with GeoAxis")).click();
	    Thread.sleep(1000);
	    driver.findElement(By.linkText("Disadvantaged Users")).click();
	    Thread.sleep(1000);
	    driver.findElement(By.id("username")).clear();
	    driver.findElement(By.id("username")).sendKeys(userPass[user][0]);
	    Thread.sleep(1000);
	    driver.findElement(By.id("password")).clear();
	    driver.findElement(By.id("password")).sendKeys(userPass[user][1]);
	    Thread.sleep(1000);
	    driver.findElement(By.name("submit")).click();
	    Thread.sleep(1000);
	    driver.manage().window().maximize();
	    
	  }

	
	/**
	 *  testStep2BFUIImagerySubmit() to accomplish testing 
	 *  of below functions of BF UI:
	 *  a) After user successfully logs in to BF UI Application
	 *  b) Selection of Create Job link
	 *  c) On the Canvas, specifying the geographic area
	 *  d) Entering the input data into the Search imagery request form.
	 *  e) Submit the form successfully 
	 *  
	 * @throws Exception
	 */
	@Test
	public void testStep2BFUIImagerySubmit() throws Exception {
		String message ="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep2BFUIImagerySubmit() <<<<");  

		driver.findElement(By.className("Navigation-linkCreateJob")).click(); 
		System.out.println(">> After requesting create job form");
		Thread.sleep(200);
		    
		WebElement canvas = driver.findElement(By.cssSelector(".PrimaryMap-root canvas"));     
	    Thread.sleep(200); //To avoid any race condition

		Actions builder = new Actions(driver);
		builder.moveToElement(canvas,900,400).click().build().perform();
	    canvas.click();
		Thread.sleep(1000); //To avoid any race condition

		builder.moveToElement(canvas,400,100).click().build().perform();
	    canvas.click();
		Thread.sleep(200);
		   
		System.out.println(">> After selecting bounding box as geographic search criteria area on canvas");
		Thread.sleep(5000); //To avoid any race condition
	       
	    // populating API key on the Imagery search form
		driver.findElement(By.cssSelector("input[type=\"password\"]")).clear();
		driver.findElement(By.cssSelector("input[type=\"password\"]")).sendKeys("27c9b43f20f84a75b831f91bbb8f3923");
		Thread.sleep(1000);
		// Changing From date field for Date of Capture imagery search criteria
		driver.findElement(By.cssSelector("input[type=\"text\"]")).clear();
		driver.findElement(By.cssSelector("input[type=\"text\"]")).sendKeys("2017-01-29");						
		Thread.sleep(500); //To avoid any race condition
	    driver.findElement(By.cssSelector("label.CatalogSearchCriteria-captureDateTo.forms-field-normal > input[type=\"text\"]")).clear();
	    driver.findElement(By.cssSelector("label.CatalogSearchCriteria-captureDateTo.forms-field-normal > input[type=\"text\"]")).sendKeys("2017-01-31");
	    Thread.sleep(500);
		new Select(driver.findElement(By.cssSelector("select"))).selectByVisibleText("RapidEye (Planet)");
		Thread.sleep(500); 
		// Submitting the search criteria
		driver.findElement(By.cssSelector("button[type=\"submit\"]")).click();
		System.out.println(">> After entering data and submitting Source Imagery search form");
		Thread.sleep(16000); //Pause before exiting this test
		
	}

	/**
	 *  testStep3BFSIResponsePopup() to accomplish testing of below functions of BF UI:
	 *  a) After user enter the search criteria for image search catalog and submits
	 *  b) Move to the map canvas panel
	 *  c) Select the response image jpg file to display the pop up
	 *     with properties of the selected response image
	 *  
	 * @throws Exception
	 */
	@Test
	public void testStep3BFSIResponsePopup(int cordArrayIndex) throws Exception {
		String message ="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep3BFSIResponsePopup() <<<<");  
	    Actions builder = new Actions(driver);
	    WebElement canvas = driver.findElement(By.cssSelector(".PrimaryMap-root canvas"));
	    WebElement search = driver.findElement(By.className("PrimaryMap-search"));
	    Thread.sleep(200); //To avoid any race condition
	    builder.moveToElement(search,0,0).click().build().perform();
	    //canvas.click(); // With or without jenkins build fails
	    Thread.sleep(1000); //To avoid any race condition
	    System.out.println("Focusing on "+cordCity[cordArrayIndex][0]+"");
	    driver.findElement(By.name("coordinate")).sendKeys(cordCity[cordArrayIndex][1]);
	    Thread.sleep(200); //To avoid any race condition
	    driver.findElement(By.name("coordinate")).submit();
	    builder.moveToElement(canvas).click().build().perform();
	    System.out.println("After moving to canvas and selecting image jpg on canvas");
	    
//	    //By clickLinkElem = By.xpath("//*[@title='LC81950572015002LGN00']");
	    //By clickLinkElem = By.xpath("//*[@title='LC82040522016276LGN00']");
	    //if (this.isElementPresent(clickLinkElem)) {
  	      // Ensuring the properties windows is displayed for the image selected
	      // LANDSAT image id for selected image should be the title.
	      // driver.findElement(By.xpath("//*[@title='LC82040522016276LGN00']"));
	      //driver.findElement(By.xpath("//*[@title='LC81210602015204LGN00']"));
	      //System.out.println("After validating properties popup is displayed for the response image selected");
	    //}
	    
		Thread.sleep(2000); //Pause before exiting this test
		
	}
	
	/**
	 *  testStep4BFSIRespPropsVldtn() for properties validation in popup window:
	 *  d) Validate the below property fields for the selected image:
 	 *		i.THUMBNAIL 
     *      ii.DATE CAPTURED
     *      iii.BANDS  
     *      iv.CLOUD COVER
     *      v.SENSOR NAME
	 *  
	 * @throws Exception
	 */
	@Test
	public void testStep4BFSIRespPropsVldtn() throws Exception {
		String message ="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep4BFSIRespPropsVldtn() <<<<");  

		WebElement canvas = driver.findElement(By.cssSelector(".PrimaryMap-root canvas"));     
	    Thread.sleep(200); //To avoid any race condition

	    driver.findElement(By.xpath("//*[contains(text(),thumbnail)]"));
	    System.out.println(">> After validating THUMBNAIL property is displayed");
	    
	    driver.findElement(By.xpath("//*[contains(text(),dateCaptured)]"));
	    System.out.println(">> After validating DATE CAPTURED property is displayed");

	    driver.findElement(By.xpath("//*[contains(text(),bands)]"));
	    System.out.println(">> After validating BANDS property is displayed");
		
	    driver.findElement(By.xpath("//*[contains(text(),cloudCover)]"));
	    System.out.println(">> After validating CLOUD COVER property is displayed");
	    
	    driver.findElement(By.xpath("//*[contains(text(),sensorName)]"));
	    System.out.println(">> After validating SENSOR NAME property is displayed");

		Thread.sleep(1000); //Pause before exiting this test
		
	}

	/**
	 *  testStep5RespImageLink() to accomplish testing of below functions of BF UI:
	 *  e) Click on the hyper link for the text “Click here to open” to display 
	 *     the jpg image file in a separate tab
	 *  
	 * @throws Exception
	 */
	@Test
	public void testStep5RespImageLink() throws Exception {
		
		String message ="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep5RespImageLink() <<<<");  
	    
		//By clickLinkElem = By.linkText("Click here to open");
    	//if (this.isElementPresent(clickLinkElem)) {
    		// Test to Click on the hyper link for “Click here to open” 
    		// to open the separate tab to display the jpg image file
    		//driver.findElement(By.linkText("Click here to open")).click();
    		//System.out.println(">> After clicking on image link to open the jpg image file in separate tab");
    	//}

		//Thread.sleep(2000); //Pause before exiting this test
		
	}

	/**
	 *  testStep6BFRunAlgoVldtn() for validation of Run Algorithm form on LHS panel:
 	 *		i.Job Name 
     *      ii.BANDS  
     *      iii.CLOUD COVER
	 *  
	 * @throws Exception
	 */
	@Test
	public void testStep6BFRunAlgoVldtn() throws Exception {
		String message ="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep6BFRunAlgoVldtn() <<<<");  

		driver.findElement(By.xpath("//*[contains(text(),jobDetails)]"));
	    driver.findElement(By.xpath("//*[contains(text(),jobName)]"));
	    System.out.println(">> After validating Job Details section is displayed");
	    
		driver.findElement(By.xpath("//*[contains(text(),selectAlgo)]"));
		System.out.println(">> After validating Select Algorithm section is displayed");

	    driver.findElement(By.xpath("//*[contains(text(),imageRqmts)]"));
	    System.out.println(">> After validating Image Requirements section is displayed");

	    driver.findElement(By.xpath("//*[contains(text(),bands)]"));
	    System.out.println(">> After validating BANDS property is displayed");
		
	    driver.findElement(By.xpath("//*[contains(text(),cloudCover)]"));
	    System.out.println(">> After validating CLOUD COVER property is displayed");

		// Submitting the Run Algorithm create job request
		driver.findElement(By.cssSelector("button.Algorithm-startButton.typography-heading")).click();
		//runAlgoJobInitiated = dateFormat.format(cal.getTimeInMillis());
		DateFormat df = new SimpleDateFormat("HH:mm:ss:SS:aa");
		Calendar calobj = Calendar.getInstance();
		runAlgoJobInitiated=df.format(calobj.getTime());
		System.out.println(">> After Submitting the Run Algorithm create job request at: "+runAlgoJobInitiated+"");
		Thread.sleep(1000); //Pause before exiting this test
		
	}
	
	/**
	 *  testStep7JobsExcnVldtn() for validation of Run Algorithm form on LHS panel:
 	 *		i.Job Name 
     *      ii.BANDS  
     *      iii.CLOUD COVER
	 *  
	 * @throws Exception
	 */
	@Test
	public void testStep7JobsExcnVldtn() throws Exception {
		String message="";
		System.out.println(">>>> In BFUIJobsExcnVldtn.testStep7JobsExcnVldtn() <<<<");  

		String Status = driver.findElement(By.cssSelector("div.JobStatus-summary.JobStatus-buffered-container > span")).getText();
		int counter = 0;
        if (Status.equalsIgnoreCase("Error")) {
        	System.out.println(">> Job is already in Error Status");
        	jobError = true;
        }
		
		if (!Status.equalsIgnoreCase("Error")){
			
			if (!Status.equalsIgnoreCase("Success")) {
	    		jobSuccess = false;
	    		while (!this.jobSuccess) {
	    			Status = driver.findElement(By.cssSelector("div.JobStatus-summary.JobStatus-buffered-container > span")).getText();
	    			Thread.sleep(1000);
	    			counter++;
	    			//driver.navigate().refresh();
	    			//Thread.sleep(1000);
	    			if (Status.equalsIgnoreCase("Success")) {
	    				System.out.println(">> Job has COMPLETED with SUCCESS status");
	    	    		DateFormat df = new SimpleDateFormat("HH:mm:ss:SS:aa");
	    	    		Calendar calobj = Calendar.getInstance();
	    	    		runAlgoJobCompleted=df.format(calobj.getTime());
	    	    		System.out.println("Job Started at "+runAlgoJobInitiated+" and ended "+runAlgoJobCompleted +"");
	    	    		jobSuccess = true;
	    	    		System.out.println("Success: Job Started at "+runAlgoJobInitiated+" and ended "+runAlgoJobCompleted+"");
	    	    		break;
	    	    	}
	    			//driver.navigate().refresh();
	    			Thread.sleep(1000);
	    			if (Status.equalsIgnoreCase("Running")) {
	    	    		//System.out.println(">> This Job is still Running");
	    	    		jobSuccess = false;
	    	    	} else {
	    	    		//driver.navigate().refresh();
		    			Thread.sleep(1000);   			    			
		    			if (Status.equalsIgnoreCase("Error") || counter>400) {
		    				System.out.println(">> ** Job has FAILED with ERROR Status ");
		    	    		DateFormat df = new SimpleDateFormat("HH:mm:ss:SS:aa");
		    	    		Calendar calobj = Calendar.getInstance();
		    	    		runAlgoJobCompleted=df.format(calobj.getTime());
		    	    		System.out.println("Job Started at "+runAlgoJobInitiated+" and ended "+runAlgoJobCompleted+"");
		    	    		System.out.println("Failure: Job Started at "+runAlgoJobInitiated+" and ended "+runAlgoJobCompleted+"");
		    	    		jobError = true;
		    	    		jobSuccess = false;
		    	    		break;
		    	    	}
	    	    	}
	    		}
			}else{
				System.out.println(">> Job has COMPLETED with SUCCESS status");
	    		DateFormat df = new SimpleDateFormat("HH:mm:ss:SS:aa");
	    		Calendar calobj = Calendar.getInstance();
	    		runAlgoJobCompleted=df.format(calobj.getTime());
	    		System.out.println("Job Started at "+runAlgoJobInitiated+" and ended "+runAlgoJobCompleted);
	    		jobSuccess = true;
	    		System.out.println("Success: Job Started at "+runAlgoJobInitiated+" and ended "+runAlgoJobCompleted);
			}
    	}
		Thread.sleep(1000);
	    driver.findElement(By.cssSelector("h3.JobStatus-title.JobStatus-buffered-container > span")).click();
	    Thread.sleep(1000);
	    driver.findElement(By.cssSelector("i.fa.fa-cloud-download")).click();
	    Thread.sleep(1000);
	    driver.findElement(By.cssSelector("a.JobStatus-download")).click();
	    Thread.sleep(1000);
	    driver.findElement(By.cssSelector("div.JobStatus-removeToggle > button")).click();
	    Thread.sleep(1000);
	    driver.findElement(By.cssSelector("div.JobStatus-removeWarning > button")).click();;
	}

	/**
	 *  To clean up the resources used and close the browser session
	 * @throws Exception
	 */
	@After
	  public void tearDown() throws Exception {
		System.out.println("Closing Browser Session");
	    driver.quit();
	    String verificationErrorString = verificationErrors.toString();
	    if (!"".equals(verificationErrorString)) {
	      fail(verificationErrorString);
	    }

	  } 
}