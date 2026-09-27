# ========================================
# Build stage
# ========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["Learnify.Api.csproj", "./"]

RUN dotnet restore "Learnify.Api.csproj"

COPY . .

RUN dotnet publish "Learnify.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# ========================================
# Runtime stage
# ========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["dotnet", "Learnify.Api.dll"]