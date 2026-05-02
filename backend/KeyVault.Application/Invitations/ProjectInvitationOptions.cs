namespace KeyVault.Application.Invitations;

public class ProjectInvitationOptions
{
	public static readonly string Section = "ProjectInvitation";
	
	public TimeSpan Lifetime { get; set; } = TimeSpan.FromHours(1);
}