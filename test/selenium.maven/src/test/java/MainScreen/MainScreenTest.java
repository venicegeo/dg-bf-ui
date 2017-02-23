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

import java.util.regex.Pattern;
import java.net.URL;
import java.util.concurrent.TimeUnit;
import org.junit.*;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Select;

public class MainScreenTest {
  private WebDriver driver;
  private String baseUrl;
  private boolean acceptNextAlert = true;
  private StringBuffer verificationErrors = new StringBuffer();

  @Before
  public void setUp() throws Exception {
	System.setProperty("webdriver.chrome.driver", "C:/users/administrator/downloads/chromedriver.exe");
	baseUrl = "https://beachfront.stage.geointservices.io/";
	DesiredCapabilities capabilities = DesiredCapabilities.chrome();
	capabilities.setBrowserName("chrome");
	capabilities.setPlatform(Platform.WINDOWS);
	driver= new RemoteWebDriver(new URL("http://localhost:5566/wd/hub"), capabilities);
}

  @Test
  public void testBeachfrontMain() throws Exception {
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
    System.out.println("Login completed");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("button.ol-zoom-out")).click();
    System.out.println("Zoom out selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("button.ol-zoom-in")).click();
    System.out.println("Zoom in selected");
    Thread.sleep(500);
    driver.findElement(By.xpath("//div[10]/button")).click();
    Thread.sleep(500);
    driver.findElement(By.xpath("//div[10]/button")).click();
    Thread.sleep(500);
    driver.findElement(By.xpath("//a[contains(@href, 'map.png')]")).click();
    Thread.sleep(500);
    System.out.println("Download image in selected");
    driver.findElement(By.cssSelector("i.fa.fa-caret-down")).click();
    Thread.sleep(500);
    driver.findElement(By.xpath("//div/ul/li[2]")).click();
    System.out.println("Dark grey  selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("div.BasemapSelect-button > span")).click();
    Thread.sleep(500);
    driver.findElement(By.xpath("//div/ul/li[3]")).click();
    System.out.println("Ariel  selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("i.fa.fa-caret-down")).click();
    Thread.sleep(500);
    driver.findElement(By.xpath("//div/ul/li[4]")).click();
    System.out.println("Road/terrain  selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("i.fa.fa-caret-down")).click();
    Thread.sleep(500);
    driver.findElement(By.cssSelector("ul.BasemapSelect-options > li")).click();
    System.out.println("Default selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("a.Navigation-linkCreateProductLine.Navigation-link  > svg.Navigation-icon > path")).click();
    System.out.println("Creat product line selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("a.Navigation-linkProductLines.Navigation-link  > svg.Navigation-icon")).click();
    System.out.println("Product line selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("a.Navigation-linkCreateJob.Navigation-link  > svg.Navigation-icon")).click();
    System.out.println("Create job line selected");   
    Thread.sleep(500);
    driver.findElement(By.cssSelector("a.Navigation-linkJobs.Navigation-link  > svg.Navigation-icon > path")).click();
    System.out.println("Jobs selected");
    Thread.sleep(500);
    driver.findElement(By.cssSelector("a.Navigation-linkHelp.Navigation-link > svg.Navigation-icon > path")).click();
    System.out.println("Help selected");
    Thread.sleep(500);
    //driver.findElement(By.cssSelector("path")).click();
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

  private boolean isAlertPresent() {
    try {
      driver.switchTo().alert();
      return true;
    } catch (NoAlertPresentException e) {
      return false;
    }
  }

  private String closeAlertAndGetItsText() {
    try {
      Alert alert = driver.switchTo().alert();
      String alertText = alert.getText();
      if (acceptNextAlert) {
        alert.accept();
      } else {
        alert.dismiss();
      }
      return alertText;
    } finally {
      acceptNextAlert = true;
    }
  }
}
