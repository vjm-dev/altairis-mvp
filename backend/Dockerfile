FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Altairis.Backend.csproj", "."]
RUN dotnet restore "Altairis.Backend.csproj"

COPY . .
RUN dotnet build "Altairis.Backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Altairis.Backend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
RUN apt-get update && apt-get install -y curl
ENTRYPOINT ["dotnet", "Altairis.Backend.dll"]