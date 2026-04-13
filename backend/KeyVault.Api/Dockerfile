FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["KeyVault.Api/KeyVault.Api.csproj", "KeyVault.Api/"]
COPY ["KeyVault.Application/KeyVault.Application.csproj", "KeyVault.Application/"]
COPY ["KeyVault.Domain/KeyVault.Domain.csproj", "KeyVault.Domain/"]
COPY ["KeyVault.Infrastructure/KeyVault.Infrastructure.csproj", "KeyVault.Infrastructure/"]
RUN dotnet restore "KeyVault.Api/KeyVault.Api.csproj"
COPY . .
WORKDIR "/src/KeyVault.Api"
RUN dotnet build "./KeyVault.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./KeyVault.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KeyVault.Api.dll"]
