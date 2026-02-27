#!/usr/bin/env python3
"""
Programmatic Usage Examples for User Story Generator Agent

This file shows how to use the agent programmatically in Python code.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from generator import UserStoryGenerator
from models import StoryInput, ExistingStory, DetailLevel, Domain


def example_1_basic_generation():
    """Example 1: Basic story generation"""
    print("=" * 60)
    print("Example 1: Basic Story Generation")
    print("=" * 60)

    generator = UserStoryGenerator()

    story = generator.generate(
        title="User can reset password",
        domain="Core",
        description="Users need to reset their password if they forget it",
    )

    print(story.to_markdown())
    print("\n")


def example_2_with_context():
    """Example 2: Story generation with context"""
    print("=" * 60)
    print("Example 2: Story with Context")
    print("=" * 60)

    generator = UserStoryGenerator()

    story = generator.generate(
        title="User can filter items by category",
        domain="Marketplace",
        description="Users want to filter items by category to find what they need faster",
        context={
            "user_type": "authenticated ITESO user",
            "platform": "web",
            "priority": "medium",
        },
    )

    print(story.to_markdown())
    print("\n")


def example_3_with_existing_stories():
    """Example 3: Story generation with duplication checking"""
    print("=" * 60)
    print("Example 3: With Duplication Checking")
    print("=" * 60)

    # Define existing stories
    existing_stories = [
        ExistingStory(
            id="US-001",
            title="User authentication with ITESO credentials",
            domain="Core",
        ),
        ExistingStory(
            id="US-010", title="User can publish an item", domain="Marketplace"
        ),
        ExistingStory(
            id="US-011", title="User can view item details", domain="Marketplace"
        ),
    ]

    generator = UserStoryGenerator()

    story = generator.generate(
        title="User can publish items for reuse",  # Similar to US-010
        domain="Marketplace",
        description="Users want to create and publish items",
        existing_stories=existing_stories,
    )

    # Check for duplicates
    if story.possible_duplicates:
        print("⚠️ Possible duplicates detected:")
        for dup in story.possible_duplicates:
            print(f"  - {dup}")

    print("\n")


def example_4_validation():
    """Example 4: Story validation"""
    print("=" * 60)
    print("Example 4: Story Validation")
    print("=" * 60)

    generator = UserStoryGenerator()

    story = generator.generate(
        title="User can view notifications",
        domain="Core",
        description="Users want to see their notifications in real-time",
    )

    # Validate the story
    is_valid, errors = story.validate()

    if is_valid:
        print("✅ Story is valid!")
    else:
        print("❌ Story has validation errors:")
        for error in errors:
            print(f"  - {error}")

    # Check if story is too large
    is_large, message = story.is_too_large()
    if is_large:
        print(f"\n⚠️ Warning: {message}")

    print("\n")


def example_5_using_story_input():
    """Example 5: Using StoryInput object"""
    print("=" * 60)
    print("Example 5: Using StoryInput Object")
    print("=" * 60)

    # Create story input
    story_input = StoryInput(
        title="User can request an item",
        domain="Marketplace",
        description="Users can request items from other users for exchange or donation",
        context={
            "user_type": "authenticated ITESO user",
            "platform": "web",
            "priority": "high",
        },
        existing_stories=[
            ExistingStory(
                id="US-010", title="User can publish an item", domain="Marketplace"
            )
        ],
        detail_level=DetailLevel.DETAILED,
    )

    generator = UserStoryGenerator()
    story = generator.generate_from_input(story_input)

    print(story.to_markdown())
    print("\n")


def example_6_save_to_file():
    """Example 6: Generate and save to file"""
    print("=" * 60)
    print("Example 6: Save Story to File")
    print("=" * 60)

    generator = UserStoryGenerator()

    story = generator.generate(
        title="User can edit their profile",
        domain="Core",
        description="Users want to update their profile information including name, bio, and avatar",
    )

    # Save to file
    output_file = Path(__file__).parent / "generated-story-example.md"
    output_file.write_text(story.to_markdown())

    print(f"✅ Story saved to: {output_file}")
    print("\n")


def example_7_batch_generation():
    """Example 7: Batch story generation"""
    print("=" * 60)
    print("Example 7: Batch Story Generation")
    print("=" * 60)

    generator = UserStoryGenerator()

    # Define multiple stories to generate
    story_specs = [
        {
            "title": "User can view home feed",
            "domain": "Core",
            "description": "Users see a personalized feed of recent items",
        },
        {
            "title": "User can search for items",
            "domain": "Marketplace",
            "description": "Users can search items by keywords and filters",
        },
        {
            "title": "User earns points for actions",
            "domain": "Gamification",
            "description": "Users receive points for publishing, donating, and exchanging items",
        },
    ]

    generated_stories = []

    for spec in story_specs:
        story = generator.generate(**spec)
        generated_stories.append(story)
        print(f"✅ Generated: {story.title}")

    print(f"\n📊 Total stories generated: {len(generated_stories)}")
    print("\n")


def example_8_custom_detail_level():
    """Example 8: Using different detail levels"""
    print("=" * 60)
    print("Example 8: Custom Detail Level")
    print("=" * 60)

    # Generate with comprehensive detail
    generator = UserStoryGenerator(detail_level=DetailLevel.COMPREHENSIVE)

    story = generator.generate(
        title="User can manage their items",
        domain="Marketplace",
        description="Users can view, edit, and delete their published items",
    )

    print(f"Story has {len(story.acceptance_criteria)} acceptance criteria")
    print(f"Story has {len(story.implementation.backend)} backend items")
    print(f"Story has {len(story.implementation.frontend)} frontend items")
    print("\n")


def main():
    """Run all examples"""
    print("\n🤖 User Story Generator - Programmatic Usage Examples\n")

    examples = [
        example_1_basic_generation,
        example_2_with_context,
        example_3_with_existing_stories,
        example_4_validation,
        example_5_using_story_input,
        example_6_save_to_file,
        example_7_batch_generation,
        example_8_custom_detail_level,
    ]

    for i, example in enumerate(examples, 1):
        try:
            example()
        except Exception as e:
            print(f"❌ Example {i} failed: {e}\n")

    print("=" * 60)
    print("✅ All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
