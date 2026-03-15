TENHO Q COLOCA O N8NCONFIG.JAVA NO GITGNORE


Pasta entity:
É onde ficam as classes que representam as tabelas do banco de dados. Cada entity vira uma tabela no PostgreSQL automaticamente.

nullable = false:
Significa que esse campo é obrigatório no banco, não pode ficar vazio. Por exemplo nullable = false no email significa que todo usuário precisa ter um email cadastrado.

@GeneratedValue(strategy = GenerationType.IDENTITY):
Significa que o id vai ser gerado automaticamente pelo banco, ou seja, você não precisa passar o id na hora de criar um usuário, o PostgreSQL cria sozinho começando do 1, 2, 3 e assim por diante.



LocalDateTime:
É o tipo de dado que armazena data e hora, por exemplo 2026-02-26T19:30:00. Usamos pra saber quando o restaurante foi criado no sistema.

@ManyToOne:
Define o relacionamento entre tabelas. No caso do Restaurante, significa que muitos restaurantes podem pertencer a um único usuário. Pensa assim, um dono pode ter vários restaurantes, mas cada restaurante tem só um dono.

@JoinColumn:
É a coluna que faz a ligação entre as duas tabelas no banco. O name = "usuario_id" significa que na tabela de restaurantes vai ter uma coluna chamada usuario_id guardando o id do dono daquele restaurante.

DTO significa Data Transfer Object.
Basicamente é um objeto que usamos para controlar o que entra e o que sai da API, sem expor diretamente a entidade do banco.
Por exemplo, a entidade Usuario tem o campo senha. Se você retornar a entidade direto na API, a senha vai aparecer na resposta para o cliente, o que é um problema de segurança grave.
Com o DTO você cria um objeto UsuarioDTO só com os campos que você quer expor, como nome, email, telefone, e a senha nunca sai da API.
Resumindo, a entidade representa a tabela no banco, e o DTO representa o que você manda e recebe nas requisições. É uma boa prática muito valorizada no mercado.

Controllers! Eles são responsáveis por receber as requisições HTTP da API.


no controler

@GetMapping: indica que esse método responde a requisições HTTP do tipo GET, ou seja, quando alguém acessar GET /api/usuarios esse método vai ser chamado.

ResponseEntity: é o objeto que representa a resposta HTTP completa, com status code e o corpo da resposta.

List<UsuarioDTO>: significa que a resposta vai ser uma lista de usuários.
ResponseEntity.ok(...): retorna a resposta com status 200 OK junto com a lista de usuários no corpo.
Resumindo, quando alguém fizer uma requisição GET pra /api/usuarios o sistema vai retornar uma lista com todos os usuários cadastrados no banco!


O JwtService é responsável por tudo relacionado ao token JWT. Basicamente ele faz três coisas:
Gerar o token: quando o usuário faz login com email e senha, esse serviço cria um token único pra ele. Esse token é como um "crachá" que o usuário vai usar pra acessar as rotas protegidas da API.
Validar o token: quando o usuário faz uma requisição, esse serviço verifica se o token é válido e se não está expirado.
Extrair informações do token: como o email do usuário por exemplo, que fica guardado dentro do token.
Resumindo, sem esse serviço qualquer pessoa poderia acessar qualquer rota da API sem precisar fazer login. Com ele garantimos que só usuários autenticados acessam os dados!


o arquivo jwAuthFilter é um filtro de autenticação

Ele funciona como uma "portaria" que intercepta todas as requisições antes de chegarem nos controllers. Funciona assim:
Passo 1: quando chega uma requisição ele verifica se tem um token no cabeçalho Authorization no formato Bearer token.
Passo 2: se não tiver token deixa passar, pois algumas rotas são públicas como login e cadastro.
Passo 3: se tiver token ele extrai o email do usuário de dentro do token.
Passo 4: busca o usuário no banco pelo email e valida se o token é válido e não está expirado.
Passo 5: se tudo estiver certo ele libera o acesso à rota, se não bloqueia.
Resumindo, é ele quem garante que rotas protegidas como listar pedidos ou criar restaurantes só sejam acessadas por usuários logados com token válido!



o arquivo securtyconfig.java é a configuração de segurança da aplicação

Ele define as regras de quem pode acessar o quê na API. Funciona assim:
userDetailsService: ensina o Spring como buscar um usuário no banco pelo email na hora de autenticar.
securityFilterChain: define as regras de acesso, por exemplo rotas que começam com /api/auth/ como login e cadastro são públicas e qualquer um pode acessar. Todas as outras rotas precisam de token JWT.
authenticationProvider: conecta o sistema de autenticação com o banco de dados e o encoder de senha.
authenticationManager: gerencia o processo de autenticação em si, é ele quem valida email e senha na hora do login.
passwordEncoder: define que as senhas serão criptografadas com BCrypt, ou seja, a senha nunca fica salva em texto puro no banco.
Resumindo, é o arquivo que deixa a API segura definindo quais rotas são públicas, quais são protegidas e como o login funciona!



o authocontroller.java tem dois endpoints:
/api/auth/cadastro: recebe os dados do usuário como nome, email e senha e cria ele no banco. Retorna o usuário criado.
/api/auth/login: recebe email e senha, valida no banco, e se estiver correto retorna um token JWT que o usuário vai usar pra acessar as rotas protegidas.
Esses dois endpoints são públicos, ou seja, qualquer um pode acessar sem precisar de token, pois é por aqui que o usuário entra no sistema pela primeira vez!


sobre o n8n

O Webhook é basicamente uma URL que fica "escutando" requisições. Quando alguém manda uma mensagem para essa URL ela dispara o fluxo do n8n automaticamente.
No nosso caso funciona assim:
O usuário digita uma mensagem no front-end, o front-end manda pro Spring Boot, o Spring Boot chama a URL do Webhook do n8n, o n8n recebe a mensagem, processa com o Gemini e retorna a resposta, o Spring Boot pega a resposta e manda de volta pro front-end, e o usuário vê a resposta do chatbot na tela.
É como um "carteiro" que recebe a mensagem e entrega para o fluxo de IA processar!


no arquuvo chatService o RestTemplate: é o cliente HTTP do Spring. É ele quem faz a requisição para o n8n, pensa nele como um Postman automático dentro do código.

Map body: é o corpo da requisição que vai pro n8n. Estamos mandando dois campos, a mensagem que é o que o usuário digitou e o sessionId que é um identificador único da conversa para o chatbot lembrar o histórico.


uma obs: as <> <?> <string> etc... sao chamda de Generics em java
É uma forma de dizer ao Java qual tipo de dado vai dentro de uma coleção ou objeto. 

Map<String, Object>: significa um mapa onde a chave é uma String e o valor pode ser qualquer Object. Por exemplo "mensagem" -> "quero uma pizza".
Map<?, ?>: o ? significa que você não sabe o tipo exato, é um coringa. Estamos dizendo "pode ser qualquer tipo de chave e qualquer tipo de valor". Usamos quando não temos certeza do que vai vir na resposta.
ResponseEntity<?>: o ? aqui significa que o corpo da resposta pode ser qualquer tipo


Resumindo, os <> servem para você ser mais específico sobre o tipo de dado que está trabalhando, evitando erros e deixando o código mais seguro. Quando você não sabe o tipo usa ? como coringa!


Map  é uma estrutura de dados que armazena pares de chave e valor, igual a um dicionário!
Exemplo: 
Map<String, String> dados = new HashMap<>();
dados.put("nome", "João");
dados.put("email", "joao@email.com");


o arquivo chatController  cria um endpoint POST /api/chat/mensagem que o front-end vai chamar quando o usuário enviar uma mensagem.
Funciona assim passo a passo:
Recebe a requisição: o front-end manda um JSON com a mensagem do usuário e opcionalmente um sessionId.
SessionId: se o front-end não mandar um sessionId ele gera um automaticamente com UUID.randomUUID(). O sessionId é importante para o chatbot lembrar o histórico da conversa.
Chama o ChatService: passa a mensagem e o sessionId para o service que vai chamar o n8n.
Retorna a resposta: devolve pro front-end a resposta do chatbot e o sessionId para ser usado nas próximas mensagens da conversa.
Resumindo, é a porta de entrada do chatbot na sua API!


````SOBRE FRONTED ```4


O arquivo vite.config.ts é a configuração do Vite, que é a ferramenta que roda o seu projeto React. Estamos adicionando dois plugins nele:
react(): permite o Vite entender e compilar arquivos React com JSX e TypeScript.
tailwindcss(): integra o Tailwind diretamente no Vite, assim ele processa as classes de estilo automaticamente sem precisar de configuração extra.


estrtura das pastas src 
pages - onde vão ficar as telas
components - onde vão ficar os componentes reutilizáveis
services - onde vão ficar as chamadas para a API
contexts - onde vai ficar o contexto de autenticação


`Axios` -> O axios é uma biblioteca que facilita fazer requisições HTTP, é ele que vai conectar o front-end com o Spring Boot.


api.js -> Esse arquivo faz duas coisas importantes. Primeiro cria uma instância do axios já configurada com a URL base do back-end. Segundo adiciona um interceptor que automaticamente coloca o token JWT em todas as requisições, assim você não precisa ficar passando o token manualmente em cada chamada!


O react-router-dom é a biblioteca que gerencia a navegação entre as telas. Sem ele clicar em um link recarregaria a página inteira, com ele a navegação é instantânea.


useState: é um hook do React que cria variáveis que quando mudam atualizam a tela automaticamente. No nosso caso temos três:

email guarda o que o usuário digita no campo email
senha guarda o que o usuário digita no campo senha
erro guarda a mensagem de erro se o login falhar


useNavigate: é um hook do react-router-dom que permite navegar entre páginas pelo código. Usamos ele para redirecionar o usuário para a home depois do login.

handleLogin ->   função que roda quando o usuário clica em "Entrar". Ela faz três coisas, manda o email e senha pro back-end, salva o token no localStorage se der certo, e redireciona para a home. Se der errado mostra a mensagem de erro.

toLowerCase(): converte uma string para letras minúsculas. Usamos ele na busca para que a pesquisa não seja sensível a maiúsculas


useEffect: é um hook do React que executa um código quando o componente é carregado ou quando alguma variável muda. No nosso caso estamos usando.


O switch é uma forma de verificar o valor de uma variável e executar um código diferente pra cada valor possível.
É basicamente um substituto pra vários if/else if encadeados.

O que são essas bibliotecas:

SockJS — é o cliente que faz a conexão com o /ws que configuramos no backend
STOMP — é o protocolo de mensagens que o Spring usa por cima do WebSocket. É ele que permite se inscrever em tópicos como /topic/pedidos/1






const [menuAtivo, setMenuAtivo] = useState('loja');

Isso se chama desestruturação de array. Você está dizendo "pega o primeiro item do retorno e chama de menuAtivo, e o segundo item chama de setMenuAtivo".
O nome pode ser qualquer coisa, mas a convenção é sempre [variavel, setVariavel] onde o set indica que é a função que vai atualizar o valor!
isso poupa linhas de codigo!!



scrollIntoView — faz o browser rolar até aquele elemento
behavior: 'smooth' — a rolagem é suave, não pula de repente
[mensagens] — o efeito roda toda vez que a lista de mensagens mudar

setMensagens(prev => [...prev, { role: 'user', texto }]) — adiciona a mensagem do usuário na lista. O ...prev copia todas as mensagens anteriores e adiciona a nova no final