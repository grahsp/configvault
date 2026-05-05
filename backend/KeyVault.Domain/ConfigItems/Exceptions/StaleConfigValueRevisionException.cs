using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.ConfigItems.Exceptions;

public sealed class StaleConfigValueRevisionException(uint expectedRevision, uint actualRevision)
	: DomainException(
		$"Config value revision conflict. Expected revision '{expectedRevision}', but current revision is '{actualRevision}'.");
