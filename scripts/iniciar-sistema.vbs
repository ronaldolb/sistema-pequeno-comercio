' Liga o sistema de pequeno comercio em segundo plano (sem janela de terminal na tela) e
' abre o navegador automaticamente depois de alguns segundos.
'
' Como usar: crie um ATALHO para este arquivo (botao direito > Criar atalho) e coloque o
' atalho na pasta de inicializacao do Windows (Win+R > shell:startup). Nao mova nem copie
' o .vbs em si para la - ele descobre sozinho onde o projeto esta, a partir de onde ele
' mesmo foi salvo.

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
raizProjeto = fso.GetParentFolderName(scriptDir)
backendDir = raizProjeto & "\backend"

If Not fso.FolderExists(backendDir) Then
  MsgBox "Nao encontrei a pasta 'backend' em " & raizProjeto & vbCrLf & _
         "Confira se este arquivo continua dentro de 'scripts', na raiz do projeto.", _
         vbExclamation, "Sistema de pequeno comercio"
  WScript.Quit
End If

shell.CurrentDirectory = backendDir
shell.Run "cmd /c node dist\main.js", 0, False

WScript.Sleep 3000
shell.Run "http://localhost:3000"
