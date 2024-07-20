import requests
from bs4 import BeautifulSoup
import time
import random
from typing import List, Tuple
from openai import OpenAI
from urllib.parse import quote
from langchain_community.document_loaders import WikipediaLoader
from concurrent.futures import ThreadPoolExecutor

class UniversalWebScraper:
    def __init__(self, openai_api_key: str):
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.openai_client = OpenAI(api_key=openai_api_key)
        self.executor = ThreadPoolExecutor(max_workers=2)  # Use 2 threads for parallel processing

    def fetch_page(self, url: str, retries: int = 3) -> str:
        for _ in range(retries):
            try:
                response = self.session.get(url, headers=self.headers)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                print(f"Error fetching {url}: {e}")
                time.sleep(random.uniform(1, 3))
        return ""

    def get_entity_info(self, entity_name: str, source: str) -> Tuple[str, str]:
        if source == "marvel":
            base_url = "https://marvelcinematicuniverse.fandom.com/wiki/Special:Search?query="
        else:  # DC
            base_url = "https://dc.fandom.com/wiki/Special:Search?query="

        search_url = base_url + quote(entity_name.replace(" ", "_"))
        search_html = self.fetch_page(search_url)

        if search_html:
            soup = BeautifulSoup(search_html, 'html.parser')
            first_result = soup.select_one('ul.unified-search__results li')
            if first_result:
                result_link = first_result.select_one('a')
                if result_link:
                    entity_url = result_link['href']
                    entity_html = self.fetch_page(entity_url)
                    if entity_html:
                        entity_soup = BeautifulSoup(entity_html, 'html.parser')
                        title = entity_soup.select_one('h1.page-header__title')
                        title = title.text.strip() if title else entity_name
                        
                        # Extract all relevant content from the page
                        description_elements = entity_soup.find_all(
                            ["p", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "dl", "dt", "dd", "pre"]
                        )
                        description = " ".join([element.text.strip() for element in description_elements])
                        
                        # Limit description to 10000 characters (adjust as needed)
                        description = description[:20000] + "..." if len(description) > 20000 else description
                        return title, description

        # Fallback to Wikipedia if web scraping fails
        print(f"Falling back to Wikipedia for {entity_name}")
        wiki_data = WikipediaLoader(query=f"{entity_name} {source}", load_max_docs=1).load()
        if wiki_data:
            title = wiki_data[0].metadata['title']
            description = wiki_data[0].page_content[:20000] + "..." 
        else:
            title = entity_name
            description = "No information available."

        return title, description

    def get_entities(self, source: str) -> List[str]:
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"List 5 popular and familiar {'Marvel movies' if source == 'marvel' else 'DC characters'}. Provide only the names, one per line."}
            ]
        )
        return [entity.strip() for entity in response.choices[0].message.content.split('\n') if entity.strip()][:5]

    def generate_markdown(self, source: str) -> str:
        entities = self.get_entities(source)
        markdown = f"# {'Marvel Movies' if source == 'marvel' else 'DC Characters'}\n\n"
        for i, entity in enumerate(entities, 1):
            title, description = self.get_entity_info(entity, source)
            markdown += f"{i}) {title}\n{description}\n\n"
        return markdown

    def format_with_llm(self, markdown: str) -> str:
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Format the following information into a concise markdown format. "
                                    "For each entry, provide a detailed description, ensuring at least five paragraphs using the following format:\n\n"
                                    "# Category Title\n"
                                    "1) Entity Name\n"
                                    "* Detailed Description (at least five paragraphs)\n\n"
                                    "If you cannot generate five paragraphs for an entry, please provide as many as possible, but **always** include a placeholder line like '* [Continue description here]' to signal that more information is needed."},
                {"role": "user", "content": f"Here's the information to format:\n\n{markdown}\n\nFormatted output:"}
            ]
        )
        formatted_output = response.choices[0].message.content.strip()

        # Check for the placeholder line and prompt for more information if needed
        if "* [Continue description here]" in formatted_output:
            print("Need more information for some entries...")
            for i, entry in enumerate(formatted_output.split("\n\n"), 1):
                if "* [Continue description here]" in entry:
                    entity_name = entry.split("\n")[0].strip()  # Get the entity name from the entry
                    entity_name = entity_name.replace(")", "").strip()  # Remove the closing parenthesis 
                    print(f"Requesting more information for {entity_name}")
                    more_info = self.openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant. Provide a detailed description of the following, ensuring at least five paragraphs, using markdown format:\n\n"},
                            {"role": "user", "content": f"{entity_name}"}
                        ]
                    )
                    more_info = more_info.choices[0].message.content.strip()
                    formatted_output = formatted_output.replace(
                        "* [Continue description here]", more_info, 1
                    )  
        return formatted_output
        
    def run(self) -> Tuple[str, str]:
        marvel_future = self.executor.submit(self.generate_markdown, "marvel")
        dc_future = self.executor.submit(self.generate_markdown, "dc")
        formatted_marvel = self.format_with_llm(marvel_future.result())
        formatted_dc = self.format_with_llm(dc_future.result())
        return formatted_marvel, formatted_dc