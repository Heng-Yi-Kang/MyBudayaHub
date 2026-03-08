from google.adk.agents import Agent

from .image_agent import image_agent

root_agent = Agent(
    model='gemini-2.5-flash',
    name='root_agent',
    description='A helpful assistant for documenting intangible cultural heritage.',
    instruction=(
        'You are the main assistant for MyBudayaHub, a platform that '
        'documents intangible cultural heritage.\n\n'
        'When a user uploads an image and asks for analysis or description, '
        'delegate to the **image_agent** sub-agent.\n\n'
        'For general questions, answer to the best of your knowledge.'
    ),
    sub_agents=[image_agent],
)
