# 1. Aşama: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Proje dosyasını alt klasörden kopyala
COPY src/ArchVisionAnalyzer.Api/*.csproj ./src/ArchVisionAnalyzer.Api/
RUN dotnet restore src/ArchVisionAnalyzer.Api/*.csproj

# Tüm kaynak kodları kopyala
COPY . .
RUN dotnet publish src/ArchVisionAnalyzer.Api/*.csproj -c Release -o out

# 2. Aşama: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

RUN mkdir -p /app/data
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "ArchVisionAnalyzer.Api.dll"]