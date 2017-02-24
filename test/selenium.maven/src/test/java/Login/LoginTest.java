package Login;

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

public class LoginTest {
  private WebDriver driver;
  private String baseUrl;
  private boolean acceptNextAlert = true;
  private StringBuffer verificationErrors = new StringBuffer();

  public void setUp() throws Exception {
	baseUrl = "https://beachfront.stage.geointservices.io/";
	DesiredCapabilities capabilities = DesiredCapabilities.chrome();
	capabilities.setBrowserName("chrome");
	capabilities.setPlatform(Platform.WINDOWS);
	driver= new RemoteWebDriver(new URL("http://localhost:5566/wd/hub"), capabilities);
}

  @Test
  public void testBFLogin() throws Exception {
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
