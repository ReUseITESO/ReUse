"""
GitHub Issues Integration for User Story Generator
Creates issues in GitHub and links them to a project
"""
import subprocess
import json
from typing import Optional, List
from models import UserStory


class GitHubIntegration:
    """Handles GitHub Issues creation and project linking"""
    
    def __init__(self, repo: str = "ReUseITESO/ReUse"):
        self.repo = repo
        self._check_gh_cli()
    
    def _check_gh_cli(self) -> bool:
        """Check if GitHub CLI is installed and authenticated"""
        try:
            result = subprocess.run(
                ["gh", "auth", "status"],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def _run_gh_command(self, args: List[str]) -> tuple[bool, str]:
        """Run a GitHub CLI command"""
        try:
            result = subprocess.run(
                ["gh"] + args,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return True, result.stdout.strip()
            else:
                return False, result.stderr.strip()
        except FileNotFoundError:
            return False, "GitHub CLI (gh) not installed. Install from: https://cli.github.com/"
    
    def create_issue(
        self,
        story: UserStory,
        labels: Optional[List[str]] = None,
        project: Optional[str] = None,
        assignee: Optional[str] = None
    ) -> tuple[bool, str]:
        """
        Create a GitHub Issue from a UserStory
        
        Args:
            story: The UserStory object to create an issue from
            labels: List of labels to apply (e.g., ["user-story", "core"])
            project: Project name or number to link the issue to
            assignee: GitHub username to assign the issue to
        
        Returns:
            (success, message_or_url)
        """
        # Build the issue body
        body = story.to_markdown()
        
        # Build the command
        args = [
            "issue", "create",
            "--repo", self.repo,
            "--title", story.title,
            "--body", body
        ]
        
        # Add labels
        if labels:
            for label in labels:
                args.extend(["--label", label])
        
        # Note: Domain label removed - only use labels that exist in the repo
        
        # Add to project
        if project:
            args.extend(["--project", project])
        
        # Assign to user
        if assignee:
            args.extend(["--assignee", assignee])
        
        # Run the command
        success, output = self._run_gh_command(args)
        
        if success:
            return True, f"✅ Issue created: {output}"
        else:
            return False, f"❌ Failed to create issue: {output}"
    
    def list_projects(self) -> tuple[bool, str]:
        """List available projects in the repository"""
        args = [
            "project", "list",
            "--owner", self.repo.split("/")[0],
            "--format", "json"
        ]
        
        success, output = self._run_gh_command(args)
        
        if success:
            try:
                projects = json.loads(output)
                if projects.get("projects"):
                    project_list = "\n".join([
                        f"  - {p['title']} (#{p['number']})"
                        for p in projects["projects"]
                    ])
                    return True, f"Available projects:\n{project_list}"
                else:
                    return True, "No projects found"
            except json.JSONDecodeError:
                return True, output
        else:
            return False, output
    
    def list_labels(self) -> tuple[bool, str]:
        """List available labels in the repository"""
        args = [
            "label", "list",
            "--repo", self.repo
        ]
        
        return self._run_gh_command(args)


def check_github_setup() -> tuple[bool, str]:
    """Check if GitHub CLI is properly set up"""
    try:
        # Check if gh is installed
        result = subprocess.run(
            ["gh", "--version"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return False, "GitHub CLI not installed. Install from: https://cli.github.com/"
        
        # Check if authenticated
        result = subprocess.run(
            ["gh", "auth", "status"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return False, "Not authenticated. Run: gh auth login"
        
        return True, "GitHub CLI is ready"
    
    except FileNotFoundError:
        return False, "GitHub CLI not installed. Install from: https://cli.github.com/"


def create_issue_from_story(
    story: UserStory,
    repo: str = "ReUseITESO/ReUse",
    labels: Optional[List[str]] = None,
    project: Optional[str] = None,
    assignee: Optional[str] = None
) -> tuple[bool, str]:
    """
    Convenience function to create a GitHub issue from a story
    
    Args:
        story: UserStory object
        repo: Repository in format "owner/repo"
        labels: List of labels
        project: Project name or number
        assignee: GitHub username
    
    Returns:
        (success, message)
    """
    # Check setup first
    ready, message = check_github_setup()
    if not ready:
        return False, message
    
    # Create the issue
    gh = GitHubIntegration(repo)
    return gh.create_issue(story, labels, project, assignee)
