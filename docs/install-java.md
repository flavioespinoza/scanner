# Add Java to Ubuntu 18.04

---

# Overview

> This gives a high level overview of this installation guide and how to follow along

#### Commands and Outputs

<div class='md-label'>The code blocks with the <img src='copy-paste-icon.png' class='copy-paste-icon' /> icon are <span class='md-key'>Commands</span> you can <span class='md-key'>Copy and Paste</span> into your Mac OS Terminal or Linux Shell</div>

<section class='md-cmd-block'>

<img class='copy-clip-icon' src='copy-paste-icon.png'>

```bash {.copy-clip}
sudo install awesome-package 
```

</section>

<div class='md-label md-label-output'>The indented code blocks show the expected <span class='md-key'>Output</span> from the previous <span class='md-key'>Command</span></div>

```bash {.md-output}
Install of awesome-package complete
```


#### Confirm Install

<div class='md-label'>During each command you may be asked to verify installation</div>

```bash
After this operation, 474 MB of additional disk space will be used.
Do you want to continue? [Y/n]
```

<div class='md-label'>If this happens simply hit the <span class='md-key'>y</span> key once and then press the <span class='md-key'>enter</span> key</div>

```bash
y
```

---

# Updates

> Update the Ubuntu package index by running the following commands one at a time


<div class='md-label'>Get the list of available updates for installed packages</div>

```bash {.copy-clip}
sudo apt-get update
```

<div class='md-label'>Upgrades all installed packages</div>

```bash {.copy-clip}
sudo apt-get upgrade
```

<div class='md-label'>Installs new packages and security updates required by Ubuntu since your last login</div>

```bash {.copy-clip}
sudo apt-get dist-upgrade
```

<div class='md-label md-pink'>You can execute the previous commands every time you login to your server if you wish to keep all packages up to date</div>

---

# Installation


### Check for Java

> Check for any Java versions or Java-based tools that are already installed on your Ubuntu/Linux server

<div class='md-label'>Verify that Java has not yet been installed</div>

```bash {.copy-clip}
java --version
```

<div class='md-label  md-label-output'>If Java <span class='md-key'>IS NOT</span> installed you should see the following output</div>

```bash {.copy-clip .md-output}
Command 'java' not found, but can be installed with:

apt install default-jre            
apt install openjdk-11-jre-headless
apt install openjdk-8-jre-headless 
```

<div class='md-label md-label-output'>If Java <span class='md-key'>IS</span> installed you will see an output similar to the following</div>

```bash {.md-output}
openjdk 10.0.2 2018-07-17
OpenJDK Runtime Environment (build 10.0.2+13-Ubuntu-1ubuntu0.18.04.4)
OpenJDK 64-Bit Server VM (build 10.0.2+13-Ubuntu-1ubuntu0.18.04.4, mixed mode)
```

<div class='md-label md-label-output md-pink'>If Java <span class='md-key'>IS</span> installed skip ahead to the <span class='md-key'>Set JAVA_HOME</span> step</div>


### Install the JRE

> This will install Java and the JRE (Java Runtime Environment) which will allow you to run almost all Java-based applications

<div class='md-label'>Install Default JRE</div>

```bash {.copy-clip}
sudo apt install default-jre
```

<div class='md-label'>Install JRE 11</div>

```bash {.copy-clip}
sudo apt install openjdk-11-jre-headless
```

<div class='md-label'>Install JRE 8</div>

```bash {.copy-clip}
sudo apt install openjdk-8-jre-headless 
```

<div class='md-label'>Check if Java was installed properly</div>

```bash {.copy-clip}
java --version
```

<div class='md-label  md-label-output'>If Java is installed correctly you will see the following output</div>

```bash {.copy-clip .md-output}
openjdk 10.0.2 2018-07-17
OpenJDK Runtime Environment (build 10.0.2+13-Ubuntu-1ubuntu0.18.04.4)
OpenJDK 64-Bit Server VM (build 10.0.2+13-Ubuntu-1ubuntu0.18.04.4, mixed mode)
```

### Install JDK

> This will install the JDK (Java Development Kit) which is required to compile and run specific Java-based applications not covered by the JRE

<div class='md-label'>Install default JDK</div>

```bash {.copy-clip}
sudo apt install default-jdk
```

<div class='md-label'>Check if the JDK was installed properly</div>

```bash {.copy-clip}
javac --version
```

<div class='md-label md-label-output'>If the JDK is installed properly you will see the follwing output</div>

```bash {.copy-clip .md-output}
javac 10.0.2
```


### Set JAVA_HOME

> Java-based applications require a <span class='md-key'>JAVA_HOME</span> environment variable to know where to find the JRE and JDK executables they require to compile and run

<div class='md-label'>Verify that the <span class='md-key'>JAVA_HOME</span> environment variable is set</div>

```bash {.copy-clip}
echo $JAVA_HOME
```

<div class='md-label md-label-output'>If output is empty you must set the <span class='md-key'>JAVA_HOME</span> environment variable</div>

```bash {.copy-clip .md-output}
...
```

<div class='md-label'>Use the Nano editor to add <span class='md-key'>JAVA_HOME</span> to the <span class='md-key'>environment</span> file</div>

```bash {.copy-clip}
sudo nano /etc/environment
```

<div class='md-label md-label-output'>The <span class='md-key'>environment</span> file should look something like this</div>

```bash {.copy-clip .md-output}
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
```

<div class='md-label md-label-output mb4'>Use the <span class='md-key'>Down Arrow</span> key to move cursor to bottom of file</div>
<div class='md-label md-label-output mb4'>Hit the <span class='md-key'>Enter</span> key once</div>
<div class='md-label md-label-output mb4'>Add the <span class='md-key'>JAVA_HOME</span> environment variable</div>

```bash {.copy-clip .md-output}
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"

JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64/bin/"
```

<div class='md-label md-label-output mb4'>Press <span class='md-key'>Ctrl + X</span> to exit file</div>
<div class='md-label md-label-output mb4'>You will be asked if you want to save changes</div>

```bash {.copy-clip .md-output}
Save modified buffer?  (Answering "No" will DISCARD changes.)
 Y Yes
 N No           ^C Cancel
```

<div class='md-label md-label-output mb4'>Press <span class='md-key'>Y</span> key once</div>
<div class='md-label md-label-output mb4'>Press <span class='md-key'>Enter</span> key once</div>


### Reload Environment

> Required to apply environment variable changes

<div class='md-label'>Reload the <span class='md-key'>environment</span> file</div>

```bash {.copy-clip}
source /etc/environment
```

<div class='md-label'>Check if JAVA_HOME is set correctly</div>

```bash {.copy-clip}
echo $JAVA_HOME
```

<div class='md-label'>If <span class='md-key'>JAVA_HOME</span> is set correctly you will see the following output</div>

```bash {.copy-clip}
/usr/lib/jvm/java-11-openjdk-amd64/bin/
```

<div class='md-label'>Other users will need to reload the <span class='md-key'>environment</span> file or log out and log back in to run Java-based applications</div>


### Conclusion

> You now have the correct versions of Java, the JRE, and the JDK installed

<div class='md-label'>You now have the tools you need to install and run Java-based applications such as Elasticsearch</div>


