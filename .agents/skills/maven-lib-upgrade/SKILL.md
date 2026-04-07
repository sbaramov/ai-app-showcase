---
name: maven-lib-upgrade
description: Upgrades Maven library versions in pom.xml files by fetching version metadata from Maven Central. Use when upgrading dependencies, updating library versions, or modernizing Maven project dependencies.
---

# Maven Library Upgrade

Upgrades Maven dependency versions in pom.xml by querying Maven Central metadata.

## Quick Reference

Maven Central metadata URL:
```
https://repo1.maven.org/maven2/<groupId-with-dots-as-slashes>/<artifactId>/maven-metadata.xml
```

## Upgrade Modes

### Mode 1: Upgrade to latest stable version

Upgrades to the newest non-snapshot version available.

### Mode 2: Upgrade to latest minor within a major version

Upgrades to the newest non-snapshot version that shares the same major version (e.g., stay on `3.x.x` while getting the latest minor/patch).

## Procedure

### Step 1: Identify the dependency in pom.xml

Find the `<dependency>` (or `<plugin>`) block in the target pom.xml. Extract:
- `<groupId>` — e.g., `org.springframework.boot`
- `<artifactId>` — e.g., `spring-boot-starter-web`
- Current `<version>` — e.g., `3.2.4`

If the version is defined via a `<property>` (e.g., `${spring-boot.version}`), locate the property definition in the `<properties>` section or parent pom instead.

### Step 2: Determine version provenance

Before proceeding, determine where the dependency's version actually comes from. Run:

```bash
mvn dependency:tree -Dincludes=<groupId>:<artifactId>
```

Example:
```bash
mvn dependency:tree -Dincludes=org.springframework.boot:spring-boot-starter-web
```

Interpret the output:

**Direct dependency with explicit version** — The dependency is declared in this pom.xml with a `<version>` tag. Proceed to Step 3 and update the version in this pom.xml.

**Direct dependency managed by `<dependencyManagement>`** — The dependency appears in this pom's `<dependencyManagement>` section (inherited or local). The version is controlled there. Locate the `<dependencyManagement>` entry for this artifact and update the version there. If the version uses a `${property}`, update the property.

**Transitive dependency** — The dependency is pulled in by another dependency (shown indented under a parent in the tree output). **Do NOT add this artifact as a direct dependency.** Instead:
1. Note the parent dependency that pulls it in (the one listed above it in the tree).
2. Upgrade the parent dependency's version instead — the transitive version will update automatically.
3. If the parent is itself managed by `<dependencyManagement>`, update the version there.
4. If the parent is from a parent pom, see Step 2b below.

**Dependency from parent pom** — If the dependency is inherited from a `<parent>` pom (check the `<parent>` section in pom.xml), the version is managed upstream. You have two options:
- Update the parent pom's version (if you control it).
- Override the version locally by adding the dependency to this project's `<dependencyManagement>` section with the desired version.

### Step 2b: Check parent pom for dependency management

If the project has a `<parent>` declaration, inspect the parent pom for `<dependencyManagement>`:

```bash
# Find the parent pom coordinates from the <parent> section, then check its dependency management
mvn help:effective-pom | grep -A 5 "<groupId>...<artifactId>..."
```

Or examine the parent pom file directly if accessible (e.g., `../pom.xml` in multi-module projects). Look for the artifact in the parent's `<dependencyManagement>` section. If found there, update the version in the parent pom's `<dependencyManagement>` or its `<properties>` section.

### Step 3: Fetch metadata from Maven Central

Once you have identified the correct artifact to upgrade (the direct dependency, the parent of a transitive dependency, or the managed entry), construct the URL and fetch metadata:

```bash
curl -s "https://repo1.maven.org/maven2/<groupId-path>/<artifactId>/maven-metadata.xml"
```

Replace `<groupId-path>` by converting dots to slashes. Example:
- groupId: `org.springframework.boot` → path: `org/springframework/boot`
- artifactId: `spring-boot-starter-web`

Full example:
```bash
curl -s "https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/maven-metadata.xml"
```

### Step 4: Inspect the metadata

The response is XML with this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <versioning>
    <latest>3.4.1</latest>
    <release>3.4.1</release>
    <versions>
      <version>3.0.0</version>
      <version>3.0.1</version>
      <version>3.1.0</version>
      <version>3.2.4</version>
      <version>3.3.0</version>
      <version>3.4.0</version>
      <version>3.4.1</version>
    </versions>
    <lastUpdated>20250101000000</lastUpdated>
  </versioning>
</metadata>
```

Key fields:
- `<latest>` — the absolute latest version (may include snapshots)
- `<release>` — the latest stable release (never a snapshot)
- `<versions>` — complete list of all published versions

### Step 5: Determine the target version

**For latest stable upgrade:**
- Use the value in `<release>` — this is always the latest non-snapshot version.
- If `<release>` is absent, parse `<versions>`, filter out any version containing `-SNAPSHOT`, and pick the highest remaining version.

**For latest minor within a major version:**
- Extract the current major version from the existing version string (e.g., `3` from `3.2.4`).
- Parse all entries under `<versions>`.
- Filter out any version containing `-SNAPSHOT`.
- Filter to only versions where the major component matches the current major version.
- Select the highest remaining version.

Use `xmllint` or `grep`/`sed`/`awk` to parse the XML. Example with `xmllint`:

```bash
# Get the latest release version
curl -s "https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/maven-metadata.xml" \
  | xmllint --xpath '//metadata/versioning/release/text()' -

# Get all versions (one per line)
curl -s "https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/maven-metadata.xml" \
  | xmllint --xpath '//metadata/versioning/versions/version/text()' - \
  | tr ' ' '\n'
```

If `xmllint` is not available, use grep:

```bash
# Get the release version
curl -s "https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/maven-metadata.xml" \
  | grep -oP '(?<=<release>).*?(?=</release>)'

# Get all versions
curl -s "https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/maven-metadata.xml" \
  | grep -oP '(?<=<version>).*?(?=</version>)'
```

### Step 6: Verify compatibility

Before applying the upgrade, check:
- **Breaking changes**: If upgrading across a major version boundary, review the library's changelog or migration guide.
- **Property-based versions**: If the version uses a `${property}`, update the property value, not the dependency tag directly.
- **Transitive dependency conflicts**: After upgrading, re-run `mvn dependency:tree` to verify the transitive dependency resolved to the expected version and no conflicts emerged.

### Step 7: Update pom.xml

Replace the old version string with the new version in the correct location:

- **Direct version in dependency**: Update the `<version>` tag inside the `<dependency>` block.
- **Property-based version**: Update the value in the `<properties>` section.
- **Dependency management entry**: Update the `<version>` inside `<dependencyManagement><dependencies>`.
- **Plugin version**: Update the `<version>` tag inside the `<plugin>` block.
- **Parent pom**: Update the version in the parent project's pom.xml, or add an override in this project's `<dependencyManagement>`.

Preserve indentation and formatting. Only change the version string value.

**Never add a transitive dependency as a direct dependency** to upgrade its version. Always upgrade the responsible parent dependency instead.

### Step 8: Verify the build

After updating, run:

```bash
mvn clean compile
```

Or for multi-module projects:

```bash
mvn clean verify -DskipTests
```

Then re-check the dependency tree to confirm the upgrade took effect:

```bash
mvn dependency:tree -Dincludes=<groupId>:<artifactId>
```

Fix any compilation errors or dependency resolution issues that arise.

## Version Parsing Examples

Given versions list from metadata, here is how to select the target:

**Latest stable** → use `<release>` tag value directly.

**Latest minor for major version 3** from versions `["3.0.0", "3.1.0", "3.2.4", "4.0.0", "4.1.0"]`:
- Filter to major=3: `["3.0.0", "3.1.0", "3.2.4"]`
- Pick highest: `3.2.4`

**Semver comparison**: Compare version strings by splitting on `.` and comparing each numeric component left-to-right. Ignore qualifiers like `-RC1`, `-M1` unless no stable version exists — prefer stable releases over pre-releases.

## Error Handling

- **404 from Maven Central**: The artifact does not exist at that groupId/artifactId path. Verify the coordinates are correct (check for typos, check the actual artifact publishes under a different groupId).
- **No `<release>` tag**: The artifact may only have snapshot versions. In this case, do not upgrade to a snapshot unless explicitly requested.
- **Version not found in `<versions>`**: The current version may be a snapshot or a locally-built version. Proceed with caution.
- **curl fails**: Check network connectivity. Maven Central is at `https://repo1.maven.org`.
