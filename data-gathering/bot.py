'''
Python script for performing various analyses on Wikipedia articles. 
This script appears to collect data from Wikipedia and Wikidata, 
process it, and save the results to a file named "resuls.txt". 
'''

import concurrent.futures
import urllib
import sys
import json
import datetime
from urllib.request import urlopen
import urllib.parse
import chardet
from datetime import datetime
from query import store_articles, fetch_wikidata_info, get_id_and_subjects_and_grade


# Accept 
if len(sys.argv) > 2:
   WIKIPEDIA_LANGUAGE_CODE  = sys.argv[1]
   WIKIDATA_COUNTRY_ID = sys.argv[2]
else:
   print("Please provide the wikipedia language and code as a command-line argument (e.g., 'bot.py en 117' for Ghana's curriculum in English wikipedia).")
   sys.exit(1)

# Open and read the JSON configuration file and access the configuration data as a dictionary
with open("wikipedia_config.json", "r") as config_file:
   wikipedia_config = json.load(config_file)

config_key = f"{WIKIPEDIA_LANGUAGE_CODE}_{WIKIDATA_COUNTRY_ID}"
file_mapping = wikipedia_config.get(config_key)
if not file_mapping:
   print("Unsupported language or country code.")
   sys.exit(1)

# if WIKIPEDIA_LANGUAGE_CODE in wikipedia_config:
#    language_config = wikipedia_config[WIKIPEDIA_LANGUAGE_CODE]
# else:
#    print(f"Configuration not found for language '{WIKIPEDIA_LANGUAGE_CODE}'.") # Handle this case appropriately (e.g, exit the script).


id_wikidata = 1,
dimension = 1,
first_edit = 1,
note = 1,
images = 1,
views = 1,
commons_pages =  1,
commons_gallery = 1,
itwikisource = 1,
wikiversity = 1,
wikibooks = 1,
featured_in = 1,
quality = 1,
review = 1,
bibliography = 1,
coordinate = 1,
incipit_size = 1,
discussion_size = 1

# Access configuration variables based on the language
file_to_be_analysed = file_mapping["file_to_be_analysed"]
result_file = file_mapping["result_file"]
language = file_mapping["language"]
discussionURL = file_mapping["discussionURL"]
warnings_config = file_mapping["warnings_config"]
featured_template = file_mapping["featured_template"]
display_window_template = file_mapping["display_window_template"]

# delete the contents of the file before starting
results = open(result_file,"w")
results.truncate(0)
results.close()


def main():     
  
   article_file, subject_file = file_mapping['article_file'], file_mapping['subject_file']
   # fetch wikidata info, store article names and get id, subject, grade of article.
   query_results = fetch_wikidata_info(WIKIPEDIA_LANGUAGE_CODE, WIKIDATA_COUNTRY_ID)
   store_articles(query_results, article_file )
   get_id_and_subjects_and_grade(query_results, subject_file)
   
   # Detect the encoding of the file
   with open(file_to_be_analysed, 'rb') as rawdata:
      result = chardet.detect(rawdata.read(10000))

   # Open the file with the detected encoding
   with open(file_to_be_analysed, 'r', encoding=result['encoding'], errors="replace") as file:
      articles = file.readlines()
   file.close()
   # Set the maximum number of concurrent processes (adjust as needed)
   max_workers = 5

   # Process articles in parallel
   with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
      executor.map(analysis, articles)

# Function to get average page views: returns visits since the beginning of time, average dayly visits since the begininning of time, average daily visits in the specified year
def get_avg_pageviews(article_title, start, end, language):
   SUM = 0

   try:

      url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"+language+".wikipedia/all-access/user/"+article_title+"/daily/"+start+"/"+end
      html = urlopen(url).read()
      html = str(html)
      html = html.replace('{"items":[',"")
      html = html.replace(']}',"")
      n = html.count("}")


      for i in range(n):

         txt = html[:html.find("}")+1]
         SUM += int(txt[txt.find('"views":')+len('"views":'):-1])
         html =html.replace(txt,"",1)
      
      d1 = datetime.strptime(start, "%Y%m%d")
      d2 = datetime.strptime(end, "%Y%m%d")
      days = (abs((d2 - d1).days)+1)
      result = str(int(round((SUM/days),0)))

   except:
      result = "ERROR"
   
   return result

# This function returns visits since the beginning of time, average dayly visits since the begininning of time, average daily visits in the specified year
def visit(article, language):

   #YYYYMMGG Date Format
   START_ALL_TIME = "20150701"; 
   START_PREV_YEAR = "20230101"; 
   END_PREV_YEAR = "20231231"; 
   START_CURRENT_YEAR = "20240101"; 
   END_CURRENT_YEAR   = "20240531"; 

   DATE = []


   #calculate result1, total pageviews since the beginning of time, and result2, average pageviews since de beginning of time
   d1 = datetime.strptime(START_ALL_TIME, "%Y%m%d")
   d2 = datetime.strptime(END_CURRENT_YEAR, "%Y%m%d")
   days = (abs((d2 - d1).days)+1)
   ARTICLE = article.replace(" ","_")

   SUM = 0

   try:

      url ="https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"+language+".wikipedia/all-access/user/"+ARTICLE+"/daily/"+START_ALL_TIME +"/" + END_CURRENT_YEAR
      html = urlopen(url).read()
      ecc = 0 # to change
      if ecc == 0:
         html = str(html)
         html = html.replace('{"items":[',"")
         html = html.replace(']}',"")
         n = html.count("}")

         for i in range(n):
            txt = html[:html.find("}")+1]
            SUM += int(txt[txt.find('"views":')+len('"views":'):-1])
            html =html.replace(txt,"",1)

         result1 = str(SUM)
         result2 = str(int(round((SUM/days),0)))

   except:
      result1 = "ERROR"
      result2 = "ERROR"

   #calculate result3, average pageviews from previous year
   result3 = get_avg_pageviews(article, START_PREV_YEAR, END_PREV_YEAR, language)

   #calculate result4, average pageviews from current year
   result4 = get_avg_pageviews(article, START_CURRENT_YEAR, END_CURRENT_YEAR, language)
   
   return str(result1), str(result2), str(result3), str(result4)




# Function to return ID of an item
def nome2Q(item):
   return item.getID()




#This function counts the number of times the substring "</ref>" appears within the input string "text" and converts the count (which is an integer) into a string
def note(text):
   return str(text.count('</ref>'))



# Function to calculate and return the length of a given string as a string.
def dimension(text):
    return str(len(text))



# this function counts the occurrences of specific image file extensions within a given string and returns that count as a string.
def images(text):
   t = text.lower()
   img = str(t.count('.jpg')+t.count('.svg')+t.count('.jpeg')+t.count('.png')+t.count('.tiff')+t.count('.gif')+t.count('.tif')+t.count('.xcf'))
   return img

'''This function relies on external web scraping 
it reads the HTML content of the page and converts it's content to a string and then extracts a specific portion of the HTML using string manipulation. 
Specifically, it looks for the substring "created_at" and extracts the following 10 characters, which should represent the creation date of the Wikipedia article.'''

def first_edit(article, language):
   try:

      url ="https://xtools.wmflabs.org/api/page/articleinfo/"+language+".wikipedia.org/"+article.replace(" ","_")
      html = urlopen(url).read()

      html = str(html)

      html = html[html.find("created_at")+len("created_at")+3:]

      html = html[:10]

   except:

      html= "ERROR"

   return html




# This function analyzes and count specific types of tags within a given text. The results are returned as strings, making them suitable for further processing.

def warnings(t): 

   t_tmp =t
   t = t.replace("\n","")
   t = t.replace(" ","")
   t = t.lower()
   # tmp  == template
    
   with open("language_template_config.json", "r") as config_file:
      language_template_config = json.load(config_file)

   if WIKIPEDIA_LANGUAGE_CODE in language_template_config:
      language_config = language_template_config[WIKIPEDIA_LANGUAGE_CODE]
   else:
      print(f"Configuration not found for language '{WIKIPEDIA_LANGUAGE_CODE}'.") # Handle this case appropriately (e.g, exit the script).

   tmp_to_check = sum(t.count(template) for template in language_config.get("to_check"))
   tmp_synoptic = sum(t.count(template) for template in language_config.get("synoptic"))
   tmp_correct = sum(t.count(template) for template in language_config.get("correct"))
   tmp_curiosity = sum(t.count(template) for template in language_config.get("curiosity"))
   tmp_divide = sum(t.count(template) for template in language_config.get("divide")) 
   tmp_sources = sum(t.count(template) for template in language_config.get("sources"))
   tmp_localism = sum(t.count(template) for template in language_config.get("localism"))
   tmp_pov = sum(t.count(template) for template in language_config.get("pov"))
   tmp_nn = sum(t.count(template) for template in language_config.get("nn"))
   tmp_recentism = sum(t.count(template) for template in language_config.get("recentism"))
   tmp_manual_style = sum(t.count(template) for template in language_config.get("manual_style"))
   tmp_translation = sum(t.count(template) for template in language_config.get("translation"))
   tmp_wikificare = sum(t.count(template) for template in language_config.get("wikificare")) 
   tmp_stub = sum(t.count(template) for template in language_config.get("stub"))
   tmp_stub_section = sum(t.count(template) for template in language_config.get("stub_section"))
   tmp_copy_control = sum(t.count(template) for template in language_config.get("copy_control"))

   sum_of_warnings = tmp_to_check + tmp_synoptic + tmp_correct + tmp_curiosity + tmp_divide + tmp_sources + tmp_localism + tmp_pov
   sum_of_warnings += tmp_nn + tmp_recentism + tmp_manual_style + tmp_translation + tmp_wikificare + tmp_stub + tmp_stub_section + tmp_copy_control


   tmp_without_sources = sum(t.count(template) for template in language_config.get("without_sources"))
   tmp_to_clarify = sum(t.count(template) for template in language_config.get("clarify"))

   return str(sum_of_warnings), str(tmp_without_sources), str(tmp_to_clarify)




# This function is designed to iteratively find and extract templates from a text until no more templates are present
def find_template(text):

   tmp = text[2:]
   tmp2 = text[2:]
   tmp = tmp[:tmp.find("}}")+2]

   if "{{" in tmp:

      tmp3 = tmp[tmp.find("{{"):]
      tmp2 = tmp2.replace(tmp3,"$$$$$$$$$$$$$$")


      tmp2 = tmp2[:tmp2.find("}}")+2]
      tmp2 = tmp2.replace("$$$$$$$$$$$$$$",tmp3)

      return tmp2
   return tmp




# Function to calculate the length of the introduction
#Incipit means the opening of a manuscript, early printed book. Hence, incipit == introduction 
def calculate_introduction_length(text):
   incipit = text
   incipit = incipit[:incipit.find("\n==")]
   template_count  =incipit.count('{{')

   # incipitclear = incipit
   format_num = incipit.count("{{formatnum:")

   for i in range(format_num):
      tmp = incipit[incipit.find("{{formatnum:"):]
      tmp = tmp[:tmp.find("}}")+2]
      tmp2 = tmp.replace("{{formatnum:","")

      tmp2 = tmp2.replace("}}","")
      incipit = incipit.replace(tmp, tmp2)

   template_count = incipit.count("{{")

   for i in range(template_count):
      text = incipit[incipit.find("{{"):]
      template = find_template(text)
      text = text.replace("{{"+template,"")
      incipit = incipit.replace("{{"+template,"")
   incipit = incipit.replace("</ref>","")

   n = incipit.count("<ref")

   for i in range(n):

      tmp = incipit[incipit.find("<ref"):]
      tmp = tmp[:tmp.find(">")+1]
      incipit = incipit.replace(tmp,"")

   incipit = incipit.replace("[[","")
   incipit = incipit.replace("]]","")
   incipit = incipit.replace("|","")
   introduction_length = len(incipit)
   return str(introduction_length)




# Function to check if the article is a "good article"
def vdq(text, display_window_template):
   if display_window_template in text.lower():
      return "1"

   else:
      return "0"


# This function checks to if a specific template (defined by the featured_template variable) is present in the provided text.
def featured_in(text, featured_template):
   if featured_template in text.lower():
      return "1"

   else:
      return "0"

    
# Main analysis function
def analysis(article):
   # Remove the newline character at the end of the article
   article = article[:-1]
   article= article.replace(" ","_") # Wikipedia page titles are case-sensitive and spaces in page titles should be replaced with underscores.
   result = ""
   wikitext = ""

   article2 = urllib.parse.quote(article) 
   article = article.replace(" ","_")

   try:
      # Construct the Wikipedia API URL for parsing wikitext

      url = "https://"+language+".wikipedia.org/w/api.php?action=parse&page=" + article2 + "&prop=wikitext&formatversion=2&format=json"
      json_url = urlopen(url)

      data = json.loads(json_url.read())

      wikitext = data["parse"]["wikitext"]
      if "#RINVIA"  in wikitext or "#REDIRECT" in wikitext:
         article2 = wikitext[wikitext.find("[[")+2:]
         article2 = article2[:article2.find("]]")]
         article = article2
         article2 = article2.replace("_"," ")

   except:
      pass                                     

   try:
      article2 = urllib.parse.quote(article)
      article = article.replace(" ","_")
      
      url = "https://"+language+".wikipedia.org/w/api.php?action=query&titles=" + article2 +"&prop=pageprops&format=json&formatversion=2"

      json_url = urlopen(url)
      data = json.loads(json_url.read())
      wikidataid = data["query"]["pages"][0]["pageprops"]["wikibase_item"]

      url ="https://www.wikidata.org/wiki/Special:EntityData/"+wikidataid+".json"

      json_url = urlopen(url)
      wikidata = json.loads(json_url.read())



      url = "https://"+language+".wikipedia.org/w/api.php?action=parse&page=" + article2 + "&prop=wikitext&formatversion=2&format=json"

      json_url = urlopen(url)

      data = json.loads(json_url.read())

      wikitext = data["parse"]["wikitext"]



      try:
         url = "https://"+language+".wikipedia.org/w/api.php?action=parse&page=" + discussionURL + article2 + "&prop=wikitext&formatversion=2&format=json"
         json_url = urlopen(url)

         data = json.loads(json_url.read())

         wikitext_discussion = data["parse"]["wikitext"]

      except:
         wikitext_discussion = ""

      result = result + article + "\t"

      result = result + wikidataid + "\t"

   except:
      result = result + article +"\t" +"non-existent article"

      

   else:

      if first_edit:
         result = result + first_edit(article2, language) + "\t"

      if dimension:
         result = result + dimension(wikitext) + "\t"

      if images:
         result = result + images(wikitext) + "\t"

      if note:
         result = result + note(wikitext) + "\t"

         

      if warnings_config:
         for i in warnings(wikitext):
            print("some warnings")
            result = result + i + "\t"   

      if discussion_size:
         result = result + dimension(wikitext_discussion) + "\t"

      if incipit_size:
         result = result + calculate_introduction_length(wikitext) + "\t"


      if visit:
         for i in visit(article2, language):
            result = result + i + "\t"

      if vdq:
         result = result + vdq(wikitext, display_window_template) + "\t"


      if featured_in:
         result = result + featured_in(wikitext, featured_template) + "\t"



      if commons_gallery:
         try:
            result = result + wikidata["entities"][wikidataid]["claims"]["P373"][0]["mainsnak"]["datavalue"]["value"] + "\t"
         except:
            result = result + "" + "\t"



      if commons_pages:
         try:
            result = result + wikidata["entities"][wikidataid]["claims"]["P935"][0]["mainsnak"]["datavalue"]["value"] + "\t"
         except:
            result = result + "" + "\t"


      if itwikisource:
         try:
            result = result + wikidata["entities"][wikidataid]["sitelinks"]["itwikisource"]["title"] + "\t"
         except:

            result = result + "\t"

      if coordinate:
         try:
            result = result + wikidata["entities"][wikidataid]["claims"]["P625"][0]["mainsnak"]["datavalue"]["value"]["latitude"] + "\t"
            result = result + wikidata["entities"][wikidataid]["claims"]["P625"][0]["mainsnak"]["datavalue"]["value"]["longitude"] + "\t"
         except:
            result = result + "\t" + "\t"

   # Open the "results.txt" file in append mode
   results = open(result_file, 'a', encoding='utf-8', errors="replace")  # open the file in append mode
   
   results.write(result + "\n")  # add a line break after each result
   results.close()  # close the file
   print (result)

if __name__ == "__main__":
   main()
