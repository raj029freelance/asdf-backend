from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import undetected_chromedriver as uc
from selenium.webdriver.support import expected_conditions as EC
import time
import re
import json

driver = uc.Chrome(executable_path=r"/home/saranrajshri/Desktop/new/scraper/chromedriver")
results = []

def page_has_loaded():
    page_state = driver.execute_script('return document.readyState;')
    return page_state == 'complete'

def getLinksFromPage(link: str, regexPatterns: list, breakCount = 10000) -> list:
    """
    Opens the specified link and searches for the 'a' tags which has the specified regex pattern
    """
    linksList = []  
    counter = 0
    print("getting link ", link)
    driver.get(link)
    time.sleep(10)
    
    if not page_has_loaded():
        print("Page not loaded.. sleeping")
        time.sleep(5)

    
    elements = driver.find_elements(by=By.XPATH, value='//a[@href]')
    
    for element in elements:
        pageURL = element.get_attribute("href")
        print("try to find with url ", pageURL)
        for regexPattern in regexPatterns:
            if re.match(r"https://local.gethuman.com/" + regexPattern, pageURL) and (pageURL not in linksList):
                linksList.append(pageURL)
        counter += 1

    return linksList


def getContentFromPage(link: str) -> None:
    print("Getting Contents from ", link)
    driver.get(link)
    time.sleep(5)
    phoneNumber = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[1]/a').text
    companyName = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[1]/div[1]').text
    companyAddress = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[1]/div[2]').text + " " + driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[1]/div[3]').text
    numberOfEmployees = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[2]/div/div[1]/span').text
    managerName = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[2]/div/div[2]/span').text
    buisnessType = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[2]/div/div[3]/span').text
    country = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[2]/div/div[4]/span').text
    website = driver.find_element(by=By.XPATH, value='//*[@id="lay-fl-main"]/div[1]/div/div[1]/div[2]/div/div[6]/a').text
    
    record = {
        "phoneNumber": phoneNumber,
        "companyName": companyName,
        "companyAddress": companyAddress,
        "numberOfEmployees": numberOfEmployees,
        "managerName": managerName,
        "buisnessType": buisnessType,
        "country": country,
        "website": website
    }

    results.append(record)

    

def main() -> None:
    """Shell Function"""
    initialSetOfLinks = getLinksFromPage('https://local.gethuman.com/', [r"[a-z]{2}"])
    secondSetOfLinks = []
    thirdSetOfLinks = []
    finalSetOfLinks = []
    count = 0
    for link in initialSetOfLinks:
        linksList = getLinksFromPage(link, [r'[a-z]{2}/\w+', r'[a-z]{2}/\w+(?:-\w+)+', r'[a-z]+'])
        secondSetOfLinks = secondSetOfLinks + linksList

        # count += 1
        # if count == 1: 
        #     break
        # secondSetOfLinks.append(linksList)
    
    print("second", secondSetOfLinks)

    count = 0
    for link in secondSetOfLinks:
        linksList = getLinksFromPage(link, [r'[a-z]{2}/\w+(?:-\w+)+', r'[a-z]+'])
        thirdSetOfLinks += linksList

        # thirdSetOfLinks.append(linksList[0])
        # count += 1
        # if count == 1:
        #     break

    print("third", thirdSetOfLinks)
    # time.sleep(1)


    for link in thirdSetOfLinks:
        linksList = getLinksFromPage(link, [r'phone'])
        finalSetOfLinks += linksList

    print("final", finalSetOfLinks)
    for link in finalSetOfLinks:
        getContentFromPage(link)

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)

main()
