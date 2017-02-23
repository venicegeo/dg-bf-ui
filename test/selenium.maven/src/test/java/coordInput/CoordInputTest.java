package coordInput;

import java.util.regex.Pattern;

import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.sql.DataSource;

import java.awt.Robot;
import java.net.URL;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import org.junit.*;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Select;

public class CoordInputTest {
	  private WebDriver driver;
	  private String baseUrl;
	  private boolean acceptNextAlert = true;
	  private StringBuffer verificationErrors = new StringBuffer();

	  public void setUp() throws Exception {
		System.setProperty("webdriver.chrome.driver", "C:/users/administrator/downloads/chromedriver.exe");
		baseUrl = "https://beachfront.stage.geointservices.io/";
		DesiredCapabilities capabilities = DesiredCapabilities.chrome();
		capabilities.setBrowserName("chrome");
		capabilities.setPlatform(Platform.WINDOWS);
		driver= new RemoteWebDriver(new URL("http://localhost:5566/wd/hub"), capabilities);
	}


  @Test
  public void testCoordInput() throws Exception {
	  String[][] cordCity = new String[][] {
		  {"Los Angels","34,-118","340000N1180000W","11SMT0765062606","11N 407650,3762606"},
		  {"Lima","-12,-77","120000S770000W","18LTM8224172655","18S 2822241,8672655"},
		  {"Mexico City","19,-99","190000N990000W","14QNG0000000827","14N 500000,2100827"},
		  {"Chicago","40,-87","400000N870000W","16TEK0000027757","16N 500000,4427757"},
		  {"Brasilia","-15,-47","150000S470000W","23LKD8494640702","23S 284947,8340702"},
		  {"New York","40,-74","400000N740000W","18TWK8536028236","18N 585360,4428236"},
		  {"San Juan","18,-66","180000N660000W","20QJE8229392757","20N 182293,1992757"},
		  {"London","51,1","510000N0010000E","31UCS5966651728","31N 359666,5651728"},
		  {"Algiers","36,3","360000N0030000E","31SEV0000083948","31N 500000,3983948"},
		  {"Luanda","-8,13","080000S0130000E","33MTM7955815166","33S 279558,9115166"},
		  {"Cape Town","-33,18","330000S0180000E","34HBJ1970044714","34S 219700,6344714"},
		  {"Tel-Aviv","32,34","320000N0340000E","36SWA9445740872", "36N 594457,3540872"},
		  {"Moscow","55,37","550000N0370000E","37UCA7207196620","37N 372071,6096620"},
		  {"New Deli","28,77","280000N0770000E","43RFL9666798814","43N 696667,3098814"},
		  {"Sydney","-33,151","330000S1510000E","56HLJ1315246936","56H 334368 6250946"},
		  {"Tokyo","35,139","350000N1390000E","54SUD1748374870","54N 317483 3874870"},
		  {"Honolulu","21,-157","210000N1570000W","4QGJ0788923448", "4N 707889,2323448"}
		  };
    driver.get(baseUrl + "/");
    driver.findElement(By.linkText("Login with GeoAxis")).click();
    Thread.sleep(1000);
    driver.findElement(By.linkText("Disadvantaged Users")).click();
    Thread.sleep(1000);
    driver.findElement(By.id("username")).clear();
    driver.findElement(By.id("username")).sendKeys("PzTestPass13");
    Thread.sleep(1000);
    driver.findElement(By.id("password")).clear();
    driver.findElement(By.id("password")).sendKeys("P1azzauserpassword*");
    Thread.sleep(1000);
    driver.findElement(By.name("submit")).click();
    Thread.sleep(1000);
	Actions myMouse = new Actions(driver);
	driver.navigate().refresh();
	Thread.sleep(1000);
	WebElement search = driver.findElement(By.className("PrimaryMap-search"));
	WebElement canvas = driver.findElement(By.cssSelector(".PrimaryMap-root canvas"));
	Robot robot = new Robot();
	Thread.sleep(500);
	for(int j =0;j<5;j++){
		Thread.sleep(500);
	for(int i = 0; i<cordCity.length;i++){
		Thread.sleep(500);
		if(j>1){
		    myMouse.moveToElement(search,0,0).click().build().perform();
		    Thread.sleep(500);
		    driver.findElement(By.name("coordinate")).clear();
		    driver.findElement(By.name("coordinate")).sendKeys(cordCity[i][j]);
		    Thread.sleep(500);
		    driver.findElement(By.cssSelector("button[type=\"submit\"]")).click();
		    Thread.sleep(500);
		    robot.mouseMove( canvas.getSize().height/2,canvas.getSize().width/2);
		    myMouse.moveToElement(canvas).click().build().perform();
		    Thread.sleep(2000);
		    String cordString = driver.findElement(By.cssSelector(".ol-mouse-position")).getText();
		    if(cordString == null || cordString.length()==0){
		    	System.out.println("Failed to find coord");
		    }else{
		    String strCordLong = cordString.substring(0, cordString.indexOf('°'));
		    String strCordLat = cordString.substring(cordString.indexOf('″')+4,cordString.indexOf('°',6));		    
		    String strCordLong2 = cordCity[i][1].substring(0,cordCity[i][1].indexOf(","));
		    String strCordLat2 = cordCity[i][1].substring(cordCity[i][1].indexOf(",")+1, cordCity[i][1].length());
		    
		    int intCordLong = cordString.indexOf('S')==-1?Integer.parseInt(strCordLong):Integer.parseInt(strCordLong)*-1;
		    int intCordLat = cordString.indexOf('W')==-1?Integer.parseInt(strCordLat):Integer.parseInt(strCordLat)*-1;
		    
		    System.out.println(cordCity[i][j]);
		    System.out.println(cordString);
		    System.out.println(intCordLong+" "+intCordLat);
		    System.out.println(strCordLong2+" "+strCordLat2);
		    
		    if(intCordLong==Integer.parseInt(strCordLong2)+1 || intCordLong==Integer.parseInt(strCordLong2)-1 || intCordLong==Integer.parseInt(strCordLong2)){
		    	System.out.println("coord correct");
		    }else{
		    	System.out.println("coord incorrect");
		    }
		    if(intCordLat==Integer.parseInt(strCordLat2)+1 || intCordLat==Integer.parseInt(strCordLat2)-1 ||intCordLat==Integer.parseInt(strCordLat2)){
		    	System.out.println("coord correct");
		    }else{
		    	System.out.println("coord incorrect");
		    }
		    }
		}else{
			System.out.println(cordCity[i][j]);
		}
		Thread.sleep(500);
	}
	}

  }

  @After
  public void tearDown() throws Exception {
    driver.quit();
    String verificationErrorString = verificationErrors.toString();
    if (!"".equals(verificationErrorString)) {
      fail(verificationErrorString);
    }
  }
  
  
  private boolean isElementPresent(By by) {
    try {
      driver.findElement(by);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }
  }